# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@example.com (replace with your email)

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

## Security Best Practices

### Environment Variables

* **Never commit `.env` files** - They contain sensitive credentials
* Use `.env.example` as a template with placeholder values
* Rotate secrets regularly in production
* Use different credentials for development and production

### Authentication

* All authentication is handled through Supabase
* JWT tokens are used for session management
* Tokens expire after 7 days by default
* Refresh tokens are used for extended sessions

### Code Execution

* All code execution happens in isolated Docker containers
* Execution time is limited to prevent resource exhaustion
* Memory limits are enforced
* Network access is restricted in execution environments

### API Security

* Rate limiting is enforced on all API endpoints
* CORS is configured to allow only trusted origins
* Input validation is performed on all user inputs
* SQL injection protection through parameterized queries

### Data Protection

* All data is encrypted in transit (HTTPS/WSS)
* Sensitive data is encrypted at rest in Supabase
* User passwords are hashed using bcrypt
* Personal data follows GDPR compliance guidelines

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.
