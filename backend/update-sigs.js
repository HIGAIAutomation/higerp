const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-templates.ts');
let content = fs.readFileSync(filePath, 'utf8');

const oldSigBlock = `  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>HIG AI AUTOMATION LLP</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
      <p>Date: ______________</p>
    </div>
  </div>`;

const newSigBlock = `  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>HIGAI AUTOMATION LLP</strong></p>
      <!-- Admin/CEO Signature (Default) -->
      <div style="font-family: 'Playfair Display', cursive; font-size: 24px; color: #1e293b; margin: 15px 0 5px 0; font-style: italic;">Ajay S</div>
      <div class="sig-line" style="margin-top: 5px;"></div>
      <p class="sig-label" style="text-transform: none; font-weight: bold; font-size: 13px; color: #0f172a;">Mr. Ajay S</p>
      <p class="sig-label" style="text-transform: none;">CEO & Founder of HIGAI AUTOMATION LLP</p>
      <p>Date: {{startDate}}</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line client-sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
      <p>Date: ______________</p>
    </div>
  </div>`;

content = content.split(oldSigBlock).join(newSigBlock);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully replaced signature blocks.');
