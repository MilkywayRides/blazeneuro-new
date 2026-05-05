import modal

app = modal.App("boutique-ai")
image = modal.Image.debian_slim().pip_install(
    "diffusers", "torch", "transformers", "accelerate", "trellis"
)

@app.function(image=image, gpu="A10G", timeout=600)
def generate_images(prompt: str, num_images: int = 4):
    from diffusers import StableDiffusionXLPipeline
    import torch
    
    pipe = StableDiffusionXLPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        torch_dtype=torch.float16
    ).to("cuda")
    
    angles = ["front view", "side view", "back view", "three-quarter view"]
    images = []
    
    for angle in angles:
        full_prompt = f"{prompt}, {angle}, product photography, white background"
        image = pipe(full_prompt).images[0]
        images.append(image)
    
    return images

@app.function(image=image, gpu="A10G", timeout=600)
def generate_3d(image_urls: list):
    from trellis.pipelines import TRELLISImageTo3DPipeline
    
    pipeline = TRELLISImageTo3DPipeline.from_pretrained("JeffreyXiang/TRELLIS-image-large")
    pipeline = pipeline.to("cuda")
    
    outputs = pipeline.run(image_urls, seed=42)
    
    return outputs

@app.local_entrypoint()
def main():
    pass
