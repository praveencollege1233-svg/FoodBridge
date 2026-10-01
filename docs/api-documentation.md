# FoodBridge API

Base URL: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer <token>`. JSON error responses use `{ "success": false, "message": "..." }`.

## Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create donor, NGO, or volunteer account |
| POST | `/auth/login` | Public | Sign in and receive a one-day JWT |
| GET | `/auth/me` | Signed in | Return the current account |

Admin registration is disabled. Use `npm run create-admin` in the server directory for the first admin.

## Donations and requests

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/donations` | Signed in | List available, unexpired donations |
| GET | `/donations/mine` | Donor | List the donor's listings |
| POST | `/donations` | Verified donor | Publish a listing |
| PATCH | `/donations/:id/cancel` | Verified donor | Cancel an available listing |
| POST | `/requests/donations/:donationId` | Verified NGO | Request a quantity |
| GET | `/requests/mine` | NGO | List requests and delivery status |
| GET | `/requests/managed` | Donor | List requests for the donor's listings |
| PATCH | `/requests/:id/status` | Verified donor | Approve or reject a pending request |
| PATCH | `/requests/deliveries/:id/confirm` | Verified NGO | Confirm delivered food was received |

Approving a request reserves the donation and creates one delivery. Competing pending requests for the same listing are rejected.

## Deliveries and administration

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/deliveries/available` | Volunteer | List unassigned deliveries |
| GET | `/deliveries/mine` | Volunteer | List assigned deliveries |
| PATCH | `/deliveries/:id/claim` | Volunteer | Claim an available delivery |
| PATCH | `/deliveries/:id/status` | Volunteer | Mark `picked_up` or `delivered` in order |
| GET | `/admin/overview` | Admin | Read platform totals and pending organizations |
| PATCH | `/admin/users/:userId/verification` | Admin | Set verification to `verified` or `rejected` |

## Donation request example

```json
{
  "quantity": 12,
  "note": "Pickup van available before 5 PM"
}
```

Donation fields: `title`, `description`, `category`, `quantity`, `unit`, `pickupAddress`, `pickupBy`. `quantity` is the unclaimed amount; `totalQuantity` preserves the originally published amount. Categories are `prepared`, `produce`, `bakery`, `dairy`, `pantry`, and `other`; units are `meals`, `kg`, `boxes`, and `items`.