import modal
from typing import List, Dict

app = modal.App("search-ranker")
image = modal.Image.debian_slim().pip_install("torch", "numpy", "fastapi[standard]")

@app.cls(image=image, gpu="T4")
class SearchRanker:
    @modal.enter()
    def setup(self):
        import torch
        import torch.nn as nn
        
        self.torch = torch
        self.model = nn.Sequential(
            nn.Linear(384, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        self.criterion = nn.BCELoss()
    
    @modal.method()
    def rank(self, query: str, results: List[Dict]) -> List[Dict]:
        self.model.eval()
        with self.torch.no_grad():
            for r in results:
                features = self._extract_features(query, r)
                score = self.model(self.torch.tensor(features, dtype=self.torch.float32)).item()
                r['ai_score'] = score
        return sorted(results, key=lambda x: x['ai_score'], reverse=True)
    
    @modal.method()
    def train(self, batch: List[Dict]):
        self.model.train()
        for item in batch:
            features = self.torch.tensor(self._extract_features(item['query'], item['result']), dtype=self.torch.float32)
            target = self.torch.tensor([item['clicked']], dtype=self.torch.float32)
            
            pred = self.model(features)
            loss = self.criterion(pred, target)
            
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()
        return {"status": "trained", "samples": len(batch)}
    
    def _extract_features(self, query: str, result: Dict) -> List[float]:
        q_lower = query.lower()
        title = result.get('title', '').lower()
        desc = result.get('description', '').lower()
        
        features = [
            1.0 if q_lower in title else 0.0,
            1.0 if q_lower in desc else 0.0,
            len(set(q_lower.split()) & set(title.split())) / max(len(q_lower.split()), 1),
            len(title) / 100.0,
            result.get('views', 0) / 1000.0,
        ]
        return features + [0.0] * (384 - len(features))

web_image = modal.Image.debian_slim().pip_install("fastapi[standard]")

@app.function(image=web_image)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI
    from pydantic import BaseModel
    
    class RankRequest(BaseModel):
        query: str
        results: List[Dict]
    
    class TrainRequest(BaseModel):
        batch: List[Dict]
    
    web_app = FastAPI()
    ranker = SearchRanker()
    
    @web_app.post("/rank_results")
    async def rank_results(req: RankRequest):
        return await ranker.rank.remote.aio(req.query, req.results)
    
    @web_app.post("/train_model")
    async def train_model(req: TrainRequest):
        return await ranker.train.remote.aio(req.batch)
    
    return web_app
