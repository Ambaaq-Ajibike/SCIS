# SCIS - Smart Connected Framework for Integrated Healthcare Administration

A comprehensive healthcare administration system built with modern technologies to enable interoperability, patient feedback analysis, and intelligent resource planning.

## 🏗️ Architecture Overview

### Technology Stack
- **Backend**: ASP.NET Core WebAPI (C#)
- **Database**: PostgreSQL with Entity Framework Core
- **Machine Learning**: ML.NET for analytics and predictions
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Mobile**: Flutter for cross-platform patient app
- **APIs**: FHIR-compliant endpoints for healthcare interoperability

### System Modules

#### Module 1: Service-Level Connected Framework (Interoperability)
- Healthcare institution onboarding with RBAC
- Patient consent management with biometric authentication
- Secure FHIR-compliant data exchange
- Comprehensive audit logging and metrics

#### Module 2: Secure & Privacy-Aware Knowledge Management
- Patient feedback collection via Flutter mobile app
- Treatment Evaluation Score (TES) calculation
- ML-powered sentiment analysis and performance insights
- Admin dashboard for performance monitoring

#### Module 3: Intelligent Planning & Coordination
- Performance Index calculation across hospitals
- Predictive analytics for patient volumes
- Resource allocation recommendations
- Performance gap analysis and alerts

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- PostgreSQL 14+
- Node.js 18+
- Flutter 3.0+
- Visual Studio 2022 or VS Code

### Backend Setup

1. **Clone and build the solution**
   ```bash
   git clone <repository-url>
   cd SCIS
   dotnet restore
   dotnet build
   ```

2. **Configure PostgreSQL**
   - Install PostgreSQL and create a database named `scis_db`
   - Update connection string in `src/SCIS.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=scis_db;Username=your_username;Password=your_password"
     }
   }
   ```

3. **Run the API**
   ```bash
   cd src/SCIS.API
   dotnet run
   ```
   The API will be available at `https://localhost:5001`

### Frontend Setup (Admin Dashboard)

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:3000`

### Mobile App Setup (Flutter)

1. **Install Flutter dependencies**
   ```bash
   cd mobile
   flutter pub get
   ```

2. **Run the app**
   ```bash
   flutter run
   ```

## 📊 System Features

### Admin Dashboard
- **Real-time Analytics**: Hospital performance metrics, TES scores, and patient volumes
- **Interactive Charts**: Performance trends, sentiment analysis, and forecasting
- **Hospital Rankings**: Performance-based hospital comparison
- **Alert System**: Automated notifications for performance issues
- **Resource Planning**: ML-powered recommendations for resource allocation

### Patient Mobile App
- **Feedback Submission**: Easy-to-use forms for treatment evaluation
- **Rating System**: Pre-treatment, post-treatment, and satisfaction ratings
- **History Tracking**: View past feedback submissions
- **Sentiment Analysis**: AI-powered analysis of text feedback
- **Secure Authentication**: Biometric consent and secure login

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/validate` - Token validation

#### Data Requests (FHIR-compliant)
- `POST /api/datarequest/request` - Request patient data
- `GET /api/datarequest/history` - Request history

#### Feedback Management
- `POST /api/feedback/submit` - Submit patient feedback
- `GET /api/feedback/doctor/{id}/average-tes` - Doctor TES scores
- `GET /api/feedback/hospital/{id}/average-tes` - Hospital TES scores
- `GET /api/feedback/insights` - Performance insights

#### Machine Learning
- `POST /api/ml/clustering` - Performance clustering analysis
- `POST /api/ml/sentiment` - Sentiment analysis
- `GET /api/ml/forecast/{hospitalId}` - Patient volume forecasting
- `GET /api/ml/performance-index/{hospitalId}` - Performance index calculation

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Hospital Manager, Doctor, Staff, Patient roles
- **Biometric Consent**: Patient consent management with biometric verification
- **FHIR Compliance**: Healthcare data interoperability standards
- **Audit Logging**: Comprehensive activity tracking and monitoring
- **Data Encryption**: Secure data transmission and storage

## 📈 Machine Learning Capabilities

### Treatment Evaluation Score (TES)
- Weighted algorithm combining pre-treatment, post-treatment, and satisfaction ratings
- Text feedback sentiment analysis integration
- Real-time calculation and performance tracking

### Predictive Analytics
- **Patient Volume Forecasting**: Time-series analysis for resource planning
- **Performance Clustering**: K-means clustering for hospital performance analysis
- **Sentiment Analysis**: NLP-powered patient feedback analysis
- **Resource Recommendations**: ML-driven resource allocation suggestions

### Performance Metrics
- **Performance Index**: Weighted combination of TES, interoperability, and volume
- **Interoperability Success Rate**: Data exchange success tracking
- **Sentiment Distribution**: Patient satisfaction trends
- **Performance Gaps**: Automated identification of improvement areas

## 🗄️ Database Schema

### Core Entities
- **Users**: Hospital staff with role-based permissions
- **Hospitals**: Healthcare institutions with performance metrics
- **Patients**: Patient records with consent management
- **PatientConsent**: Biometric consent tracking
- **DataRequest**: FHIR-compliant data exchange requests
- **PatientFeedback**: Treatment evaluation and sentiment data
- **AuditLog**: Comprehensive activity logging

## 🧪 Testing

### API Testing
Use the Swagger UI at `https://localhost:5001/swagger` to test API endpoints.

### Demo Credentials
- **Hospital Manager**: `manager1@citygeneral.com` / `password123`
- **Doctor**: `sarah.johnson@citygeneral.com` / `password123`
- **Staff**: `staff1@citygeneral.com` / `password123`
- **Patient**: `patient@demo.com` / `password123`

## 📱 Mobile App Features

### Patient Feedback Form
- Doctor selection with specialty information
- Treatment description (optional)
- Pre-treatment rating (1-5 stars)
- Post-treatment rating (1-5 stars)
- Overall satisfaction rating (1-5 stars)
- Text feedback with sentiment analysis
- Real-time TES calculation

### History & Analytics
- View past feedback submissions
- TES score tracking
- Sentiment analysis results
- Performance trends over time

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
API_BASE_URL=http://localhost:5000/api

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/scis_db

# JWT Configuration
JWT_KEY=your-super-secret-jwt-key
JWT_ISSUER=SCIS.API
JWT_AUDIENCE=SCIS.Users
```

### Docker Support
```bash
# Run with Docker Compose
docker-compose up -d
```

## 📚 API Documentation

Full API documentation is available via Swagger UI when running the backend:
- **Development**: `https://localhost:5001/swagger`
- **Production**: `https://your-domain.com/swagger`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@scis-healthcare.com
- **Documentation**: [Project Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## 🎯 Roadmap

- [ ] Advanced ML models for disease prediction
- [ ] Real-time notification system
- [ ] Mobile app for healthcare providers
- [ ] Integration with EHR systems
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Cloud deployment guides

---

**SCIS - Transforming Healthcare Administration Through Smart Connected Systems**
