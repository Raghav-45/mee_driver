const Razorpay = require('razorpay');
var instance = new Razorpay({
  key_id: 'rzp_test_bflHpE37hU5CbO',
  key_secret: 'om8x7KvWW6wiQYcFkJ8p2ZMs',
});

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Process a POST request
    var options = {
      amount: (req.body.amount * 100), // amount in the smallest currency unit
      currency: "INR"
    };
  
    instance.orders.create(options, function(err, order) {
      res.status(200).json(order);
    });
  } else {
    // Handle any other HTTP method
  }
}