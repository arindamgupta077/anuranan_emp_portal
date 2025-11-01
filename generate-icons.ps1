# PowerShell script to generate PNG icons from SVG
# Requires: Chrome or Edge browser installed

Write-Host "🎨 Generating PNG icons from SVG..." -ForegroundColor Cyan
Write-Host ""

# Create a temporary HTML file for conversion
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Icon Generator</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #1e40af;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 40px;
        }
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 30px 0;
        }
        .preview-card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            border: 2px solid #e5e7eb;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .preview-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .preview-card h3 {
            color: #1e40af;
            margin-bottom: 15px;
        }
        canvas {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            margin: 10px 0;
            background: white;
        }
        .btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            margin: 10px 5px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
        }
        .btn:active {
            transform: translateY(0);
        }
        .info {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .success {
            background: #f0fdf4;
            border-left: 4px solid #22c55e;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            display: none;
        }
        .icon-display {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
            padding: 30px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border-radius: 12px;
        }
        .icon-sample {
            text-align: center;
        }
        .icon-sample img {
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .icon-sample p {
            color: white;
            margin-top: 10px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Anuranan App Icon Generator</h1>
        <p class="subtitle">Bengali Recitation Training Portal</p>
        
        <div class="info">
            <strong>📱 Icon Theme:</strong> Yellow & Blue | <strong>🔤 Design:</strong> Letter "A" with sound waves
        </div>

        <div class="icon-display">
            <div class="icon-sample">
                <img src="icon.svg" width="120" height="120" alt="App Icon">
                <p>Main App Icon</p>
            </div>
            <div class="icon-sample">
                <img src="favicon.svg" width="64" height="64" alt="Favicon">
                <p>Favicon</p>
            </div>
        </div>

        <div class="preview-grid">
            <div class="preview-card">
                <h3>📱 Icon 192x192</h3>
                <canvas id="canvas192" width="192" height="192"></canvas>
                <button class="btn" onclick="downloadCanvas('canvas192', 'icon-192.png')">
                    💾 Download
                </button>
            </div>
            
            <div class="preview-card">
                <h3>📱 Icon 512x512</h3>
                <canvas id="canvas512" width="512" height="512"></canvas>
                <button class="btn" onclick="downloadCanvas('canvas512', 'icon-512.png')">
                    💾 Download
                </button>
            </div>
            
            <div class="preview-card">
                <h3>🌐 Apple Touch Icon</h3>
                <canvas id="canvas180" width="180" height="180"></canvas>
                <button class="btn" onclick="downloadCanvas('canvas180', 'apple-touch-icon.png')">
                    💾 Download
                </button>
            </div>
        </div>

        <div class="success" id="successMsg">
            <strong>✅ Success!</strong> Icon downloaded successfully!
        </div>

        <div class="info">
            <strong>📋 Instructions:</strong><br>
            1. Click each "Download" button to save the PNG icons<br>
            2. Save them in your <code>public</code> folder<br>
            3. The SVG files are already created (icon.svg & favicon.svg)<br>
            4. All icons feature the letter "A" with yellow & blue theme
        </div>
    </div>

    <script>
        function loadSVGToCanvas(svgPath, canvasId, callback) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                if (callback) callback();
            };
            
            img.src = svgPath;
        }

        function downloadCanvas(canvasId, filename) {
            const canvas = document.getElementById(canvasId);
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Show success message
            const successMsg = document.getElementById('successMsg');
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);
        }

        // Load all canvases on page load
        window.onload = function() {
            loadSVGToCanvas('icon.svg', 'canvas192');
            loadSVGToCanvas('icon.svg', 'canvas512');
            loadSVGToCanvas('icon.svg', 'canvas180');
        };
    </script>
</body>
</html>
"@

# Write HTML file
$htmlPath = "public\icon-generator.html"
$htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8

Write-Host "✅ Created icon generator HTML" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Opening icon generator in browser..." -ForegroundColor Cyan
Write-Host ""

# Open in default browser
Start-Process $htmlPath

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ SVG icons created:" -ForegroundColor Green
Write-Host "   - public\icon.svg main app icon" -ForegroundColor Gray
Write-Host "   - public\favicon.svg favicon icon" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🌐 Browser opened with icon generator" -ForegroundColor Green
Write-Host "   - Click each Download button" -ForegroundColor Gray
Write-Host "   - Save PNG files to public folder" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🎨 Design Features:" -ForegroundColor Green
Write-Host "   - Blue gradient background theme colors" -ForegroundColor Gray
Write-Host "   - Yellow/gold letter A for Anuranan" -ForegroundColor Gray
Write-Host "   - Sound wave elements for recitation" -ForegroundColor Gray
Write-Host "   - Clean professional design" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
