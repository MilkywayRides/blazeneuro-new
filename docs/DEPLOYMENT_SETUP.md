# BlazeNeuro Deployment Setup

## Step 1: Add GitHub Actions Workflow to Your Repository

1. In your repository (the one you want to deploy), create this file:
   `.github/workflows/deploy.yml`

2. Copy this content into the file:

```yaml
name: Deploy to BlazeNeuro

on:
  workflow_dispatch:
    inputs:
      deployment_id:
        description: 'Deployment ID'
        required: true
      subdomain:
        description: 'Subdomain'
        required: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Next.js app
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Create deployment package
        run: |
          tar -czf deployment.tar.gz .next public package.json package-lock.json next.config.js
      
      - name: Upload to BlazeNeuro
        env:
          BLAZENEURO_API_KEY: ${{ secrets.BLAZENEURO_API_KEY }}
          DEPLOYMENT_ID: ${{ github.event.inputs.deployment_id }}
          SUBDOMAIN: ${{ github.event.inputs.subdomain }}
        run: |
          curl -X POST https://blazeneuro.com/api/deployments/$DEPLOYMENT_ID/upload \
            -H "Authorization: Bearer $BLAZENEURO_API_KEY" \
            -F "file=@deployment.tar.gz" \
            -F "subdomain=$SUBDOMAIN"
      
      - name: Notify deployment status
        if: always()
        env:
          BLAZENEURO_API_KEY: ${{ secrets.BLAZENEURO_API_KEY }}
          DEPLOYMENT_ID: ${{ github.event.inputs.deployment_id }}
        run: |
          STATUS="${{ job.status }}"
          curl -X PATCH https://blazeneuro.com/api/deployments/$DEPLOYMENT_ID \
            -H "Authorization: Bearer $BLAZENEURO_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"$STATUS\",\"githubRunId\":\"${{ github.run_id }}\"}"
```

3. Add the BlazeNeuro API key to your repository secrets:
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `BLAZENEURO_API_KEY`
   - Value: Copy from your `.env` file (BLAZENEURO_API_KEY value)

4. Commit and push the workflow file to your repository

## Step 2: Test Deployment

Once the workflow is added, click the "Deploy" button in BlazeNeuro and it will trigger the GitHub Actions workflow.

## Notes

- The workflow builds your Next.js app on GitHub's servers (free compute)
- The built files are uploaded to BlazeNeuro for hosting
- You can view build logs in both GitHub Actions and BlazeNeuro dashboard
