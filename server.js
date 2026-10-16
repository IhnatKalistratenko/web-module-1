import app from "./app.js"

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Orders API is running on http://localhost:${PORT}`);
  });