import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express()
app.use(cors());

app.use(express.json());

app.post('/ai', async (req, res) => {
  try {
     console.log("API KEY:", process.env.GROQ_API_KEY);
    const resposta = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: req.body.message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(resposta.data);

  } catch (error) {
    res.status(500).json(error.response?.data || error.message);
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));