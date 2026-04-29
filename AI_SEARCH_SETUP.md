# AI Search with Reinforcement Learning

## Architecture

1. **PyTorch Model**: Neural network that learns to rank search results
2. **Modal Backend**: Serverless GPU inference and training
3. **Data Collection**: Captures user clicks for training
4. **Batch Training**: Trains every 10 interactions

## Setup

### 1. Install Modal
```bash
pip install modal
modal token new
```

### 2. Deploy Model
```bash
modal deploy modal_search_ai.py
```

### 3. Get Endpoint URL
```bash
modal app list
# Copy the endpoint URL
```

### 4. Add to .env.local
```
MODAL_SEARCH_ENDPOINT=https://your-modal-endpoint.modal.run
```

### 5. Run Migration
```bash
psql $DATABASE_URL < migrations/create_search_interactions.sql
```

## How It Works

1. **Search**: User types query → API calls Modal → Returns ranked results with AI scores
2. **Click**: User clicks result → Stores interaction (query, result, clicked=true)
3. **Train**: After 10 interactions → Sends batch to Modal → Model updates weights
4. **Improve**: Model learns which results users prefer → Better rankings over time

## Features

- Real-time AI ranking with probability scores
- Automatic model training every 10 clicks
- GPU-accelerated inference on Modal
- Reinforcement learning from user behavior
- Visual probability display on each result

## Model Details

- Input: 384 features (text similarity, metadata)
- Architecture: 384 → 128 → 1 (sigmoid)
- Loss: Binary Cross Entropy
- Optimizer: Adam (lr=0.001)
- Training: Online learning with batches of 10
