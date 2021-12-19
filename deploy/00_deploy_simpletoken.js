module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();;
  const simpleToken = await deploy('SimpleToken', {
    from: deployer,
    args: [],
    log: true,
  });
  console.log("----------------------------------------------------");
};
module.exports.tags = ['SimpleToken'];