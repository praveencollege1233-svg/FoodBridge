# Database design

All documents use Mongoose timestamps (`createdAt`, `updatedAt`). MongoDB ObjectIds connect the workflow records.

## Collections

- **User**: name, unique normalized email, bcrypt `passwordHash`, role (`donor`, `ngo`, `volunteer`, `admin`), contact details, verification status, and active flag. Password hashes are excluded from normal queries.
- **Donation**: donor reference, food description/category, remaining `quantity`, original `totalQuantity`, unit, pickup address/deadline, and status (`available`, `reserved`, `completed`, `cancelled`).
- **DonationRequest**: donation and NGO references, requested quantity/note, and status (`pending`, `approved`, `rejected`, `delivered`).
- **Delivery**: unique request reference, donation reference, optional volunteer reference, ordered delivery status (`available`, `assigned`, `picked_up`, `delivered`, `confirmed`), and completion timestamps.

## Lifecycle

```text
Donation: available -> reserved -> completed
                   \-> cancelled

Request: pending -> approved -> delivered
                  \-> rejected

Delivery: available -> assigned -> picked_up -> delivered -> confirmed
```

Only a verified donor can publish or review requests, and only a verified NGO can request food or confirm receipt. Volunteers are not organization-verified. Admins are provisioned explicitly and are never accepted by public registration.