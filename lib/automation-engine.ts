/**
 * Automation Engine
 * 
 * Processes deal changes and executes matching automations.
 */

import dbConnect from '@/lib/db';
import Automation from '@/lib/models/Automation';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';

interface DealChange {
    dealId: string;
    dealTitle: string;
    oldStatus?: string;
    newStatus?: string;
    dealValue?: number;
    assignedToId?: string;
}

export async function processAutomations(change: DealChange) {
    try {
        await dbConnect();

        // Find matching automations
        const automations = await Automation.find({ isActive: true });

        for (const automation of automations) {
            if (shouldTrigger(automation, change)) {
                await executeActions(automation, change);
            }
        }
    } catch (error) {
        console.error('Automation Engine Error:', error);
    }
}

function shouldTrigger(automation: any, change: DealChange): boolean {
    const { trigger } = automation;

    switch (trigger.type) {
        case 'STAGE_CHANGE':
            // Match if: fromStage matches old status AND toStage matches new status
            // If fromStage is not set, match any source
            // If toStage is not set, match any destination
            const fromMatch = !trigger.fromStage || trigger.fromStage === change.oldStatus;
            const toMatch = !trigger.toStage || trigger.toStage === change.newStatus;
            return fromMatch && toMatch && change.oldStatus !== change.newStatus;

        case 'VALUE_THRESHOLD':
            if (!change.dealValue || !trigger.valueThreshold) return false;
            switch (trigger.operator) {
                case '>': return change.dealValue > trigger.valueThreshold;
                case '<': return change.dealValue < trigger.valueThreshold;
                case '>=': return change.dealValue >= trigger.valueThreshold;
                case '<=': return change.dealValue <= trigger.valueThreshold;
                case '=': return change.dealValue === trigger.valueThreshold;
                default: return false;
            }

        default:
            return false;
    }
}

async function executeActions(automation: any, change: DealChange) {
    for (const action of automation.actions) {
        try {
            switch (action.type) {
                case 'NOTIFY_USER':
                    if (action.targetUserId) {
                        await createNotification(
                            action.targetUserId,
                            action.notificationTitle || `Deal Update: ${change.dealTitle}`,
                            action.notificationMessage || `Deal "${change.dealTitle}" moved to ${change.newStatus}`,
                            'INFO',
                            { type: 'DEAL', id: change.dealId },
                            automation._id
                        );
                    }
                    break;

                case 'NOTIFY_ROLE':
                    if (action.targetRole) {
                        const users = await User.find({ role: action.targetRole });
                        for (const user of users) {
                            await createNotification(
                                user._id,
                                action.notificationTitle || `Deal Update: ${change.dealTitle}`,
                                action.notificationMessage || `Deal "${change.dealTitle}" moved to ${change.newStatus}`,
                                'INFO',
                                { type: 'DEAL', id: change.dealId },
                                automation._id
                            );
                        }
                    }
                    break;

                // SET_FIELD and others can be implemented as needed
                default:
                    console.log(`Action type ${action.type} not yet implemented`);
            }
        } catch (error) {
            console.error(`Failed to execute action: ${action.type}`, error);
        }
    }
}

async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    relatedEntity: { type: string; id: string },
    automationId: string
) {
    await Notification.create({
        userId,
        title,
        message,
        type,
        relatedEntity,
        automationId
    });
}

// Helper to trigger automations from API routes
export async function triggerDealAutomation(
    dealId: string,
    dealTitle: string,
    oldStatus: string,
    newStatus: string,
    dealValue?: number,
    assignedToId?: string
) {
    await processAutomations({
        dealId,
        dealTitle,
        oldStatus,
        newStatus,
        dealValue,
        assignedToId
    });
}
