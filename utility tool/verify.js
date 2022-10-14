/**@notice contract verification utility */

//importing required stuff......
const { run } = require("hardhat");

/**@notice contract verification async func and exporting it.....
 * @params contractAddress and arg of this contract
 */
const verify = async (contractAddress, args) => {
  console.log("verifying address.......");
  try {
    //verify by run property of hardhat enviroment
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("already verified..");
    } else {
      console.log(e.message);
    }
  }
};

module.exports = { verify };
