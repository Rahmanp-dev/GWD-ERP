import { MongoClient } from "mongodb";

const options = {
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI missing in lib/mongodb. Using fallback.");
}

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/fallback";
    if (!process.env.MONGODB_URI) { console.warn("MONGODB_URI missing, using fallback"); }
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch(e => {
      console.error("Mongo Client Connect Error (Dev):", e);
      return client; // Resolve to unconnected client
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/fallback";
  if (!process.env.MONGODB_URI) { console.warn("MONGODB_URI missing, using fallback"); }
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(e => {
    console.error("Mongo Client Connect Error (Prod):", e);
    return client;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
