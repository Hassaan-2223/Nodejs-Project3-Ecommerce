const mongoose = require("mongoose");


main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongob://localhost:27017/Products');
// }

// async function main() {
//   try {
//     await mongoose.connect('mongod://localhost:27017/Products');
//   } catch (error) {
//     console.log('MongoDB Connection Error:', error);
//     process.exit(1); // Exit with a non-zero code to indicate an error
//   }
// }


async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/Products');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.emit('unhandledRejection', error, Promise.reject(error));
    process.exit(1); // Exit with a non-zero code to indicate an error
  }
}

