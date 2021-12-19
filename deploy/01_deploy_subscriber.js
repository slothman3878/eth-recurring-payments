module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {subscriber} = await getNamedAccounts();
  const subscriberBasic = await deploy('SubscriberBasic', {
    from: subscriber,
    args: [],
    log: true,
  });
  console.log("----------------------------------------------------");
};
module.exports.tags = ['SubscriberBasic'];