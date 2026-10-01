# FoodBridge

FoodBridge is a full-stack web application built to reduce food waste by connecting donors, community organizations, volunteers, and administrators in a single action-driven platform.

The app allows restaurants, caterers, and individuals to publish surplus food, enables NGOs to request the exact quantity they need, gives volunteers a delivery workflow to transport food safely, and lets admins verify organizations and manage the system.

This project was developed as a practical solution for community-driven food redistribution and can be used for local food rescue operations, college projects, NGO coordination, and startup demos.

## Project Overview

Food waste is a major problem in many communities. Large quantities of edible food are discarded every day because restaurants, kitchens, and event organizers do not have a quick, trusted way to connect surplus food with people who can use it.

FoodBridge solves this by creating a transparent, role-based workflow:

- Donors list food that is still safe and available
- NGOs request food based on their needs
- Volunteers collect and deliver food to the right place
- Admins verify users and monitor the overall system

This creates a complete loop from donation to fulfillment.

## Key Features

### Donor features
- Register as a donor or organization
- Publish food listings with quantity, category, pickup address, and deadline
- Review incoming requests from NGOs
- Approve or reject food requests
- Track donation fulfillment progress

### NGO features
- Register and wait for admin verification
- Browse available food listings
- Request a specific quantity of food
- Confirm receipt after delivery is completed
- Coordinate food distribution with local communities

### Volunteer features
- Register immediately as a volunteer
- View assigned delivery jobs
- Mark pickup and delivery status
- Help complete the last-mile distribution workflow

### Admin features
- Verify donor and NGO accounts
- Manage pending user requests
- Monitor donation and delivery workflow activity
- Oversee platform health and user roles

### System features
- JWT-based authentication and role management
- Secure password hashing using bcrypt
- CORS, rate limiting, and Helmet security protection
- MongoDB-based persistence with Mongoose models
- Responsive frontend built with React and Vite

## User Roles and Workflow

### 1. Donor
A donor posts surplus food such as prepared meals, vegetables, fruits, bakery items, or packaged food. The listing includes:

- food title and description
- category
- quantity and unit
- pickup location
- pickup deadline

The donor can then approve or reject NGO requests.

### 2. NGO / Community Organization
After verification, an NGO reviews available food listings and submits a request for a required amount. The request is matched to an appropriate donation listing.

### 3. Volunteer
Once a request is approved, the system creates a delivery task. A volunteer picks up the food and marks the progress as collected and delivered.

### 4. Admin
The admin verifies new donor and NGO registrations before they can access the full workflow. The admin monitors the app to ensure the system remains trusted and active.

## Business Logic

The application follows a clear food distribution lifecycle:

1. Food donor posts surplus food
2. Community organization requests needed quantity
3. Donor approves the request
4. Delivery job is created for a volunteer
5. Volunteer picks up and delivers the food
6. NGO confirms receipt
7. Donation cycle is completed and tracked

This creates a complete and transparent donation flow while preventing food from being wasted unnecessarily.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Lucide icons
- CSS styling

### Backend
- Node.js
- Express.js
- JWT authentication
- bcryptjs password hashing
- MongoDB Atlas with Mongoose

### Security and reliability
- Helmet
- CORS
- Cookie parsing
- Express rate limiting

## Project Structure

```bash
FoodBridge/
├── README.md
├── client/
│   ├── package.json
│   ├── src/
│   ├── public/
│   ├── index.html
│   └── vite.config.js
├── docs/
│   ├── api-documentation.md
│   └── database-design.md
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── scripts/
└── src/
```

## Database Design

The app uses MongoDB collections for:

- users
- donations
- donation requests
- deliveries

User roles include:

- donor
- ngo
- volunteer
- admin

This model supports separate workflows while keeping all records connected to the same request lifecycle.

## Environment Setup

### Server environment
Create a `server/.env` file from the example:

```bash
cp server/.env.example server/.env
```

Then configure the values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=your-very-long-random-secret

ADMIN_NAME=FoodBridge Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-unique-password-at-least-12-characters
```

Important notes:

- `MONGO_URI` must point to a MongoDB Atlas cluster or local MongoDB instance
- The application checks the database connection before allowing API access
- Admin accounts are not created through the public registration page

### Client environment
If needed, create a `client/.env` file for custom API configuration:

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

### 1. Install dependencies

```bash
cd FoodBridge/server
npm install

cd ../client
npm install
```

### 2. Run the backend

```bash
cd FoodBridge/server
npm run dev
```

### 3. Run the frontend

```bash
cd FoodBridge/client
npm run dev
```

### 4. Access the app

Open the frontend in the browser:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

## Create the First Admin

After setting the environment variables in `server/.env`, run:

```bash
cd FoodBridge/server
npm run create-admin
```

The admin account must be created from the backend script for security and role control. Donor and NGO registrations remain pending until an admin verifies them.

## Demo Data

The project includes a demo seeding script for college presentations and testing. Run:

```bash
cd FoodBridge/server
npm run seed-demo
```

This creates sample verified donor and NGO users, along with example donation records and delivery requests that help demonstrate the app in a live presentation.

### Demo login accounts

Donor accounts:

- greenvalley.kitchen@demo.com / DemoDonor123!
- sunrise.catering@demo.com / DemoDonor456!

NGO accounts:

- hungerrelief@demo.com / DemoNgo123!
- citycare@demo.com / DemoNgo456!

Volunteer account:

- volunteer.demo@demo.com / DemoVolunteer123!

## API Health Check

The backend provides a health endpoint:

```bash
curl http://localhost:5000/api/health
```

This returns the database connectivity status and confirms whether the server can reach MongoDB.

## Build and Validation

### Frontend build

```bash
cd FoodBridge/client
npm run build
```

### Lint check

```bash
cd FoodBridge/client
npm run lint
```

## Documentation

- API documentation: [docs/api-documentation.md](docs/api-documentation.md)
- Database design: [docs/database-design.md](docs/database-design.md)

## Why This Project Matters

FoodBridge is designed to make food redistribution easier, faster, and more engaging for communities. It combines a practical real-world problem with a modern tech stack, giving a complete end-to-end flow for volunteer-based social impact solutions.

This project is suitable for:

- college or university final-year projects
- NGO technology demonstration
- startup concept validation
- social-impact application prototype

## License

This project is currently intended for academic and demonstration use.

## Contribution

This repository is meant to be extended with new features such as:

- real-time notifications
- map-based pickup tracking
- analytics dashboard
- improved donor/NGO matching
- mobile app version

## Contact

For questions or collaboration opportunities, use the project repository and maintainers' contact information available on GitHub.