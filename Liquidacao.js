// models/Liquidacao.js

const mongoose = require('mongoose');

const LiquidacaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  clube: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clube',
    required: true
  },
  quantidade: {
    type: Number,
    required: true           // Quantidade de cotas liquidadas
  },
  precoLiquidacao: {
    type: Number,
    required: true           // Preço por cota na liquidação
  },
  totalRecebido: {
    type: Number,
    required: true           // Valor total recebido pelo usuário
  },
  data: {
    type: Date,
    default: Date.now        // Data em que a liquidação foi registrada
  }
});

module.exports = mongoose.model('Liquidacao', LiquidacaoSchema);
