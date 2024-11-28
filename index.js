


const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

// Fetching data from API
async function fetchData() {
  try {
    const response = await axios.get('http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Checklist evaluation logic
function evaluateChecklist(data) {
  if (!data) return null;
  const loanRequired = parseInt(data.mortgage.loanRequired.replace(/[^0-9.-]+/g,""));
  const purchasePrice = parseInt(data.mortgage.purchasePrice.replace(/[^0-9.-]+/g,""));
  const ltv = (loanRequired / purchasePrice) * 100;

  return {
    valuationFeePaid: data.isValuationFeePaid === true,
    ukResident: data.isUkResident === true,
    riskRating: data.riskRating === 'Medium',
    ltvBelow60: ltv < 60
  };
}

// Define route for checklist
app.get('/checklist', async (req, res) => {
  const data = await fetchData();
  const results = evaluateChecklist(data);
  if (!results) {
    return res.status(500).json({ error: 'Failed to fetch or evaluate data' });
  }
  res.json(results);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
