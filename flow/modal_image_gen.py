import modal

app = modal.App("sbstylehub-image-gen")
image = modal.Image.debian_slim().pip_install(
    "diffusers", 
    "torch", 
    "transformers", 
    "accelerate",
    "fastapi",
    "pydantic"
)

@app.cls(
    image=image,
    gpu="T4",
    timeout=300,
)
class ImageGenerator:
    @modal.enter()
    def load_model(self):
        from diffusers import StableDiffusionPipeline
        import torch
        
        self.pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16,
        )
        self.pipe.to("cuda")
        self.pipe.enable_attention_slicing()
    
    @modal.method()
    def generate(self, prompt: str, num_images: int = 4):
        import torch
        
        with torch.inference_mode():
            images = self.pipe(
                prompt,
                num_images_per_prompt=num_images,
                num_inference_steps=25,
                guidance_scale=7.5,
            ).images
        
        import io
        import base64
        
        image_urls = []
        for img in images:
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            img_str = base64.b64encode(buffer.getvalue()).decode()
            image_urls.append(f"data:image/png;base64,{img_str}")
        
        return image_urls

@app.function(image=image)
@modal.web_endpoint(method="POST")
def generate_endpoint(data: dict):
    prompt = data.get("prompt", "")
    generator = ImageGenerator()
    images = generator.generate.remote(prompt)
    return {"images": images}
