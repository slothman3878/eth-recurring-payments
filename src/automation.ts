const PAYMENT_CYCLE = 1; // in seconds

const test = async ()=>{
  /// automation
  var conditions = true;
  while(conditions) {
    await new Promise((resolve)=>{setTimeout(resolve, PAYMENT_CYCLE*1000);});
    console.log('hello');
    /// payment
  }
}