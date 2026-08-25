# IT Support & Technology Guidelines - TechNova Solutions

## Getting Started as a New Employee

### Day 1 Onboarding

**Morning (Before Arrival)**
- IT team provisions laptop and equipment
- VPN credentials created
- Email account activated
- Building access card issued

**First Day Tasks**
1. Check in with front desk for building access and parking info
2. Meet with HR for orientation
3. Collect laptop, monitors, peripherals from IT desk
4. IT team assists with setup and software installation
5. Password manager enrollment (1Password)
6. Multi-factor authentication (MFA) setup

### Required Software Installation

**Mandatory for All Employees**
- Microsoft Office 365 (Office, Teams, OneDrive)
- Slack for team communication
- VPN Client (Cisco AnyConnect)
- Antivirus/EDR (CrowdStrike Falcon)
- Password Manager (1Password)
- Google Chrome or Firefox

**For Engineering Team**
- Git and GitHub Desktop
- VS Code or JetBrains IDE
- Docker Desktop
- Node.js and Python environments
- Postman or similar API testing tool

**For Design Team**
- Adobe Creative Suite (Photoshop, Illustrator, XD, Premiere)
- Figma
- Sketch (Mac only)

**For Product Management**
- Jira for project tracking
- Confluence for documentation
- Analytics tools (Mixpanel, Segment)

### Account Access

**First Week Access Provisioning**
- GitHub (engineering team): 2-3 days
- AWS/GCP (engineers): 3-5 days
- Production databases (engineers): 1-2 weeks (after security training)
- Admin tools (leads/managers): 2-3 business days
- Sensitive data access: After background check completion

**Access Request Process**
1. Manager submits request to IT via ticketing system
2. IT verifies role requirements
3. System owner approves (1-2 business days)
4. Access provisioned and confirmed
5. Security training may be required for sensitive data

## VPN Setup & Remote Access

### VPN Installation

**Windows**
1. Download Cisco AnyConnect from IT portal
2. Run installer with admin privileges
3. Launch AnyConnect, add server: vpn.technova.com
4. Enter employee ID and password
5. Approve MFA push notification on phone

**Mac**
1. Download AnyConnect DMG file
2. Double-click to mount and run installer
3. Grant system permissions when prompted
4. Configure VPN client with vpn.technova.com
5. Test connection from System Preferences

**Linux**
1. Download OpenConnect from IT portal
2. Install: `sudo apt-get install openconnect`
3. Connect: `sudo openconnect --user=[email] vpn.technova.com`
4. Enter password and MFA code when prompted

### VPN Best Practices

- Connect VPN before accessing company resources
- Keep VPN client updated
- Never share VPN credentials
- Disconnect when finished working
- Use VPN on public WiFi (airport, café, etc.)
- Report any connection issues to IT Support

## Laptop Setup & Security

### Hardware Specifications

**Standard Configuration**
- 16GB RAM minimum
- 512GB SSD minimum
- Intel i7/Apple M1 processor
- 15" screen for engineering, 13" available for other roles
- Docking station and external monitors available

**Request Different Hardware**
1. Submit justification to manager
2. Manager approves and submits to IT
3. Procurement team evaluates and approves
4. Equipment ordered and configured
5. Usually takes 1-2 weeks

### Startup Disk Encryption

**Windows**
- BitLocker automatically enabled
- Recovery key stored in secure vault
- Do NOT disable encryption

**Mac**
- FileVault automatically enabled
- Recovery key stored in secure vault
- Required for all company laptops

**Linux**
- Full disk encryption required during setup
- LUKS or dm-crypt supported
- Passphrase must be 12+ characters

### Antivirus & Security Software

- CrowdStrike Falcon automatically installed and running
- Cannot be disabled or uninstalled
- Handles malware detection and response
- Reports security incidents automatically
- Regular scans run automatically daily at 2 AM

### Firewall Configuration

- Windows/Mac: Built-in firewall enabled by default
- Linux: UFW or iptables required
- Third-party firewalls must be approved by IT
- Firewall exceptions available for legitimate business software

## Network & Internet

### Network Access

**Office WiFi**
- SSID: technova-office (2.4GHz) or technova-office-5G (5GHz)
- Authentication: WPA2-Enterprise
- Username: employee ID
- Password: Network password from 1Password

**Guest WiFi**
- SSID: technova-guest
- No registration required
- Limited to 4-hour sessions
- Used for visitors

### Bandwidth & Usage Policy

- Strictly professional use only
- No torrenting or P2P applications
- Streaming limited to business-related content
- Heavy video downloading requires IT approval
- Monitoring in place for policy violations

## Email & Communication

### Email Setup

**Outlook Desktop**
1. Launch Outlook
2. Enter email: firstname.lastname@technova.com
3. Complete authentication and MFA setup
4. Configure signature with IT template
5. Verify calendar and shared folders appear

**Web/Mobile**
1. Visit mail.office.com
2. Sign in with TechNova credentials
3. Enable MFA
4. Mobile: Install Outlook app and add account

### Email Best Practices

- Use "Reply All" cautiously
- Encrypt sensitive emails (Tools > Message > Encrypt)
- Do not share company information externally without approval
- Archive old emails regularly to maintain performance
- Set out-of-office messages when traveling

### Teams/Slack Usage

- Download from App Marketplace in Microsoft Teams
- Join #general and #announcements channels
- Set status to "Available" or "Busy" appropriately
- Mute channels you don't actively use
- Do not conduct confidential discussions in public channels

## Hardware & Device Support

### Common Issues

**Laptop Won't Start**
- Hold power button for 30 seconds
- Try safe mode (Windows) or recovery mode (Mac)
- If still not booting, contact IT immediately
- Do NOT attempt repairs yourself

**WiFi Not Connecting**
- Forget network and reconnect
- Check VPN is disconnected
- Restart WiFi adapter
- Restart laptop if above fails
- Contact IT with error messages

**Slow Performance**
- Check available disk space (aim for >10% free)
- Disable unused startup programs
- Clear browser cache
- Restart laptop
- May require OS reinstall if persistent

**Keyboard/Mouse/Monitor Issues**
1. Restart device
2. Try different USB port
3. Update drivers
4. For wireless: Replace batteries
5. Contact IT if still not working

### Hardware Repair & Replacement

- Report issues within 1 business day
- IT will troubleshoot remotely when possible
- On-site support available for complex issues
- Repair takes 2-5 days typically
- Loaner laptop available during repairs
- Accidental damage may be charged to department

## Printing & Scanning

### Printer Setup

**Windows/Mac Network Printers**
1. Go to Settings > Devices > Printers
2. Click "Add a printer"
3. Select "technova-mfp-3-color" (color) or "-bw" (black/white)
4. Driver installs automatically
5. Test print from any application

**Printer Access**
- Badge reader controls access
- Swipe badge at printer to authenticate
- Jobs print only when badge is swiped
- Helps reduce paper waste and ensure privacy

### Scanning to Email

1. Place document on scanner
2. Press color/BW button for scanning
3. Use touchscreen to navigate
4. Enter email address on keypad
5. Scan area for barcode if not obvious
6. Email sent in 1-2 minutes

## Software & Licensing

### Software Requests

**Available Without Approval**
- Browser extensions (from Chrome/Edge store)
- Text editors (VS Code, Sublime)
- Productivity tools (Trello, Notion)
- Development tools (Git, Docker, etc.)

**Requires Manager Approval**
- Paid software licenses
- Development frameworks
- Design software
- Databases or servers

**Requires CTO Approval**
- Security tools
- VPN or network software
- Admin/root access tools
- Open source with restrictive licensing

### License Compliance

- All software must be properly licensed
- No personal software on company laptops
- License audits conducted annually
- Violations may result in termination
- Use managed software from IT when available

## Mobile Device Management

### Bring Your Own Device (BYOD)

**For Business Use of Personal Devices**
1. Must meet security requirements (OS up-to-date, passcode enabled)
2. Mobile Device Management (MDM) enrollment required
3. Company app access requires MDM
4. Company can remotely wipe device if lost

**Accepted Personal Devices**
- iPhone iOS 14+
- Android 10+
- iPad OS 13+
- Not supported: Android tablets, Windows phones

### Company-Issued Mobile Devices

- Available for roles requiring frequent travel
- Request through IT with manager approval
- Device remains company property
- Company can monitor and manage remotely
- Return device if role changes or employment ends

## Data Protection & Privacy

### Data Classification

**Public**: Can be shared externally without restriction
**Internal**: For TechNova employees only
**Confidential**: Limited access, requires encryption
**Restricted**: Highest protection, limited to specific roles

### Document Handling

- Store confidential docs in OneDrive or shared drives
- Enable expiration dates on shared links
- Use "Viewer only" permissions by default
- Encrypt sensitive emails
- Do not print confidential documents unless necessary

### Screen Privacy

- Use privacy screen filter in office or public areas
- Lock computer when stepping away (Win+L or Cmd+Q)
- Do not leave confidential documents on desk
- Use quiet rooms for confidential phone calls

## Support & Troubleshooting

### Getting Help

**IT Support Portal**: https://itsupport.technova.com
**Email**: itsupport@technova.com
**Phone**: ext. 5555
**After-Hours Emergency**: 1-888-IT-HELP-1

### Submitting a Support Ticket

1. Visit itsupport.technova.com
2. Click "New Ticket"
3. Select category (Hardware, Software, Network, Security)
4. Describe issue clearly with error messages
5. Include your laptop model and OS
6. Upload screenshots if helpful
7. Submit and receive ticket number

### Expected Response Times

- Critical (system down): 1 hour
- High (cannot work): 4 hours  
- Medium (workaround available): 1 business day
- Low (feature request): 3 business days

## Security Awareness

### Password Policy

- Minimum 12 characters
- Must include uppercase, lowercase, numbers, symbols
- Change every 90 days
- Cannot reuse last 5 passwords
- Never share passwords via email or chat
- Store in 1Password encrypted vault

### Phishing Awareness

- Be suspicious of unsolicited emails
- Hover over links to verify sender domain
- Do not click links in suspicious emails
- Report phishing emails to security@technova.com
- Monthly phishing awareness training required

### Access Control

- Only share access with authorized personnel
- Revoke access when projects end
- Report lost passwords immediately
- Lock screen when away from desk
- Do not accept cookies that track personal data

## Remote Work Technical Setup

### Internet Requirements

- Minimum 25 Mbps download, 5 Mbps upload
- Wired connection preferred over WiFi
- WiFi 5/6 routers recommended if wireless required
- Backup mobile hotspot available as contingency

### Video Call Best Practices

- Use high-quality microphone and speakers
- Ensure good lighting (face is visible)
- Neutral background or blur background
- Test audio/video 5 minutes before call
- Mute when not speaking to reduce background noise

### Work From Home Security

- Enable VPN before connecting to corporate resources
- Use screenshare carefully (watch what's showing)
- Do not work from coffee shops or airports
- Close blinds if working near windows
- Lock screen when stepping away

## Emergency Procedures

### Security Incident Response

- If device is lost/stolen: Call IT immediately (ext. 5555)
- Laptop will be remotely wiped within 1 hour
- Report phishing attempts: security@technova.com
- Report unauthorized access: itsupport@technova.com

### Backup & Disaster Recovery

- OneDrive automatically syncs and backs up files
- Do not store files only on local disk
- Weekly backups run automatically
- Recovery available for deleted files (30 days)
- Test backup restoration annually

### Business Continuity

- In case of major outage, follow emergency communication
- Announcements made via email and text
- Work from home acceptable during office outages
- Non-essential services may be suspended
- Critical systems have redundancy and failover

## Contact Directory

- **Main IT Support**: itsupport@technova.com, ext. 5555
- **Help Desk**: ext. 5556
- **Network Support**: network@technova.com
- **Security Team**: security@technova.com
- **Software Licensing**: licensing@technova.com
- **After-Hours Support**: 1-888-IT-HELP-1
