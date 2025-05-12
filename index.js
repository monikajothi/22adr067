const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT = 500; 

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDMxNTU4LCJpYXQiOjE3NDcwMzEyNTgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjM3NWI0NGIzLTU3NDktNDQ3Ni04M2ZlLTEyMzU4MzNiYWNhMiIsInN1YiI6Im1vbmlrYXJqLjIyYWlkQGtvbmd1LmVkdSJ9LCJlbWFpbCI6Im1vbmlrYXJqLjIyYWlkQGtvbmd1LmVkdSIsIm5hbWUiOiJtb25pa2EgciBqIiwicm9sbE5vIjoiMjJhZHIwNjciLCJhY2Nlc3NDb2RlIjoiam1wWmFGIiwiY2xpZW50SUQiOiIzNzViNDRiMy01NzQ5LTQ0NzYtODNmZS0xMjM1ODMzYmFjYTIiLCJjbGllbnRTZWNyZXQiOiJIWnl6cFNaRkZZV1l0ZU5GIn0.iiTTwHibvBqM96Fa3U3BzG9d1DOa8myuImcR5zPxXnw";

let numberStore = [];

const API_MAP = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand'
};

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid.toLowerCase();

  if (!API_MAP[numberId]) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }

  const url = `http://20.244.56.144/evaluation-service/${API_MAP[numberId]}`;
  const windowBefore = [...numberStore];
  let newNumbers = [];

  try {
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    if (response.data && Array.isArray(response.data.numbers)) {
      newNumbers = response.data.numbers;
    }
  } catch (err) {
    console.error("Error fetching from API:", err.message);
    return res.json({
      windowPrevState: windowBefore,
      windowCurrState: numberStore,
      avg: calculateAverage(numberStore)
    });
  }

  for (const num of newNumbers) {
    if (!numberStore.includes(num)) {
      if (numberStore.length >= WINDOW_SIZE) {
        numberStore.shift(); 
      }
      numberStore.push(num);
    }
  }

  const windowAfter = [...numberStore];

  res.json({
    windowPrevState: windowBefore,
    windowCurrState: windowAfter,
    avg: calculateAverage(windowAfter)
  });
});

app.listen(port, () => {
  console.log(`✅ Average Calculator running at http://localhost:${port}`);
});
