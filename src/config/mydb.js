import mongoose from "mongoose";

let myDbConnection = null;

const getMyDbConnection = () => {
  if (myDbConnection) {
    return myDbConnection;
  }

  const uri = process.env.MYDB_URL || process.env.MYDB_URI;

  if (!uri) {
    console.warn("MYDB_URL/MYDB_URI not set; falling back to primary mongoose connection");
    myDbConnection = mongoose.connection;
    return myDbConnection;
  }

  myDbConnection = mongoose.createConnection(uri);

  myDbConnection.on("error", (err) => {
    console.error("MyDb connection error:", err?.message || err);
  });

  return myDbConnection;
};

export default getMyDbConnection;