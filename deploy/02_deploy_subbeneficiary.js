module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy} = deployments;
  const {contract_beneficiary} = await getNamedAccounts();
  const subBeneficiaryBasic = await deploy('SubBeneficiary', {
    from: contract_beneficiary,
    args: [require("../deployments/localhost/SimpleToken.json").address],
    log: true,
  });
  console.log("----------------------------------------------------");
};
module.exports.tags = ['SubBeneficiary'];