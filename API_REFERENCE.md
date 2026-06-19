# CodeLingo API Reference

Complete API documentation for CodeLingo backend.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### Register User
```
POST /auth/register

Request:
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Login User
```
POST /auth/login

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Get Current User
```
GET /auth/me

Headers: Authorization required

Response: 200 OK
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "username",
  "preferredProvider": "groq",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Code Execution Endpoints

### Execute Code
```
POST /code/execute

Headers: Authorization required

Request:
{
  "code": "print('Hello World')",
  "language": "python",
  "stdin": ""
}

Response: 200 OK
{
  "success": true,
  "output": "Hello World\n",
  "error": "",
  "status": "Accepted",
  "executionTime": 0.125,
  "memory": 15360
}
```

**Supported Languages:**
- java, python, javascript, typescript
- c, cpp (C++), csharp (C#)
- go, rust, php

**Error Response:**
```
{
  "success": false,
  "output": "",
  "error": "error: expected ';' before '}'",
  "status": "Compilation Error",
  "executionTime": 0,
  "memory": 0
}
```

### Get Execution History
```
GET /code/history

Headers: Authorization required

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "code": "print('test')",
    "language": "python",
    "input": "",
    "output": "test\n",
    "status": "Accepted",
    "executionTime": 0.1,
    "memory": 12288,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

---

## Code Analysis Endpoints

### Analyze Code
```
POST /analysis/analyze

Headers: Authorization required

Request:
{
  "code": "def divide(a, b):\n    return a / b",
  "language": "python",
  "analysisType": "bug-detection",
  "provider": null
}

Response: 200 OK
{
  "analysis": "Bug found: Division by zero not handled. 
              If b is 0, this will raise ZeroDivisionError.
              
              Recommendation: Add validation before division:
              if b == 0:
                  raise ValueError('Cannot divide by zero')"
}
```

**Analysis Types:**
- `bug-detection` - Find bugs
- `code-review` - Quality feedback
- `optimization` - Performance suggestions
- `security-analysis` - Security issues
- `complexity-analysis` - Time/space complexity
- `test-generation` - Generate unit tests
- `refactoring` - Refactoring suggestions

**Providers:** `groq` | `gemini` | `openrouter` (null = use preferred)

### Get Analysis History
```
GET /analysis/history

Headers: Authorization required

Response: 200 OK
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "code": "def divide(a, b):\n    return a / b",
    "language": "python",
    "analysisType": "bug-detection",
    "result": "Bug found: Division by zero...",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

---

## Language Conversion Endpoints

### Get Supported Conversions
```
GET /conversion/supported

Response: 200 OK
{
  "conversions": {
    "java-python": { "from": "java", "to": "python" },
    "java-javascript": { "from": "java", "to": "javascript" },
    "java-cpp": { "from": "java", "to": "c++" },
    "python-javascript": { "from": "python", "to": "javascript" },
    "python-cpp": { "from": "python", "to": "c++" },
    "c-cpp": { "from": "c", "to": "c++" },
    "cpp-javascript": { "from": "c++", "to": "javascript" }
  }
}
```

### Convert Code
```
POST /conversion/convert

Headers: Authorization required

Request:
{
  "sourceCode": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello\");\n  }\n}",
  "fromLanguage": "java",
  "toLanguage": "python",
  "provider": null
}

Response: 200 OK
{
  "convertedCode": "def main():\n    print(\"Hello\")\n\nif __name__ == \"__main__\":\n    main()",
  "conversionNotes": [
    "Java classes become Python functions",
    "Java System.out.println() becomes Python print()",
    "Java null becomes Python None"
  ]
}
```

---

## Settings Endpoints

### Get Settings
```
GET /settings

Headers: Authorization required

Response: 200 OK
{
  "preferredProvider": "groq",
  "configuredProviders": ["groq", "gemini"]
}
```

### Update API Key
```
POST /settings/api-key

Headers: Authorization required

Request:
{
  "provider": "groq",
  "apiKey": "gsk_..."
}

Response: 200 OK
{
  "message": "groq API key updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "preferredProvider": "groq"
  }
}
```

**Providers:** `groq` | `gemini` | `openrouter`

### Set Preferred Provider
```
POST /settings/provider

Headers: Authorization required

Request:
{
  "provider": "gemini"
}

Response: 200 OK
{
  "message": "Preferred provider updated",
  "preferredProvider": "gemini"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Please fill in all fields",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "message": "Route not found"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

### Limits Applied
- **Global**: 100 requests per 15 minutes
- **Code Execution**: 10 requests per minute
- **AI Analysis**: 5 requests per minute

### Headers in Response
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1705329000
```

---

## Request/Response Examples

### Example 1: Execute Java Code
```bash
curl -X POST http://localhost:5000/api/code/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World\");\n  }\n}",
    "language": "java",
    "stdin": ""
  }'
```

### Example 2: Analyze Code for Bugs
```bash
curl -X POST http://localhost:5000/api/analysis/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "var arr = [1, 2, 3];\nvar x = arr[10];",
    "language": "javascript",
    "analysisType": "bug-detection"
  }'
```

### Example 3: Convert Code
```bash
curl -X POST http://localhost:5000/api/conversion/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceCode": "def hello():\n    print(\"Hello World\")",
    "fromLanguage": "python",
    "toLanguage": "javascript"
  }'
```

---

## Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 401 | Invalid token | Re-login to get new token |
| 400 | Invalid language | Use supported language |
| 429 | Too many requests | Wait before retrying |
| 500 | AI API error | Check API key in settings |

---

## Tips & Best Practices

1. **Store Token Securely**
   - Save in httpOnly cookie or secure storage
   - Never log or expose tokens

2. **Handle Rate Limits**
   - Check RateLimit headers
   - Implement exponential backoff for retries

3. **API Key Security**
   - Never send API keys to frontend
   - Update keys regularly
   - Use different keys per provider

4. **Error Handling**
   - Implement proper error handling
   - Show user-friendly messages
   - Log errors for debugging

5. **Timeouts**
   - Set request timeout to 10 seconds
   - Code execution timeout is 5 seconds
   - AI analysis may take 10-30 seconds

---

## Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "CodeLingo API"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{...}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Need Help?

- Check [README.md](../README.md) for overview
- See [SETUP.md](../SETUP.md) for development setup
- Review [QUICKSTART.md](../QUICKSTART.md) for quick start
- Check [DEPLOYMENT.md](../DEPLOYMENT.md) for production

Happy coding! 🚀
