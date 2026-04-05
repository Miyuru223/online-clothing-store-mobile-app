# Online Clothing Store Management System
### SE2020 – Web and Mobile Technologies | Group Assignment

**Stack:** React Native + Node.js + Express.js + MongoDB

---

## 📁 Project Structure

```
clothing-store/
├── backend/              ← Node.js + Express API
│   ├── config/           ← DB & Cloudinary config
│   ├── controllers/      ← Business logic (6 controllers)
│   ├── middleware/        ← JWT auth middleware
│   ├── models/           ← Mongoose schemas (5 models)
│   ├── routes/           ← API routes (6 route files)
│   ├── server.js
│   └── .env.example
└── frontend/
    └── ClothingStoreApp/ ← React Native (Expo)
        ├── src/
        │   ├── api/        ← Axios API calls
        │   ├── context/    ← AuthContext (JWT state)
        │   ├── navigation/ ← Stack + Tab navigators
        │   └── screens/    ← All 6 module screens
        └── App.js
```

---

## 👥 Member Module Breakdown

| Member | Module         | Entity    | Key Screens |
|--------|--------------- |-----------|-------------|
| 1      | Products       | Product   | ProductList, ProductDetail, ProductForm |
| 2      | Payment        | Payment   | CategoryList, CategoryForm |
| 3      | Orders         | Order     | OrderList, OrderDetail, Checkout |
| 4      | Cart           | Cart      | CartScreen |
| 5      | Tracking       | Track     | DeliveryStatus, AddReviewScreen |
| 6      | User Profile   | User      | ProfileScreen, EditProfileScreen, ChangePasswordScreen |
| Group  | Auth           | —         | LoginScreen, RegisterScreen |

---

## 🚀 Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and fill in:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/clothing-store
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Run locally
```bash
npm run dev
```

### 4. Deploy to Render
- Push code to GitHub
- Create new **Web Service** on [render.com](https://render.com)
- Set **Build Command:** `npm install`
- Set **Start Command:** `node server.js`
- Add all environment variables in Render dashboard
- Done — grab your live URL!

---

## 📱 Frontend (React Native) Setup

### 1. Install dependencies
```bash
cd frontend/ClothingStoreApp
npm install
```

### 2. Update API base URL
Open `src/api/index.js` and replace:
```js
const BASE_URL = 'https://your-backend-url.render.com/api';
```
with your actual deployed Render URL.

### 3. Run the app
```bash
npx expo start
```
Scan the QR code with **Expo Go** app on your phone.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | ❌ | Get all products |
| GET | /api/products/:id | ❌ | Get product by ID |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/categories | ❌ | Get all categories |
| GET | /api/categories/:id | ❌ | Get by ID |
| POST | /api/categories | Admin | Create category |
| PUT | /api/categories/:id | Admin | Update category |
| DELETE | /api/categories/:id | Admin | Delete category |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/cart | ✅ | Get user's cart |
| POST | /api/cart/add | ✅ | Add item to cart |
| PUT | /api/cart/update | ✅ | Update item quantity |
| DELETE | /api/cart/remove/:pid/:size | ✅ | Remove item |
| DELETE | /api/cart/clear | ✅ | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | ✅ | Place order |
| GET | /api/orders/my | ✅ | My orders |
| GET | /api/orders/:id | ✅ | Order detail |
| GET | /api/orders | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update status |
| DELETE | /api/orders/:id | ✅ | Cancel order |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/reviews/product/:id | ❌ | Get product reviews |
| POST | /api/reviews | ✅ | Add review |
| PUT | /api/reviews/:id | ✅ | Update review |
| DELETE | /api/reviews/:id | ✅ | Delete review |

### Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/profile | ✅ | Get profile |
| PUT | /api/profile | ✅ | Update profile |
| PUT | /api/profile/change-password | ✅ | Change password |
| DELETE | /api/profile | ✅ | Delete account |

---

## ✅ Assignment Checklist

- [x] React Native frontend
- [x] Node.js + Express backend
- [x] MongoDB with Mongoose
- [x] JWT authentication (register, login, protected routes)
- [x] Password hashing (bcryptjs)
- [x] File upload (Cloudinary + Multer)
- [x] Full CRUD for 6 entities
- [x] RESTful API structure
- [x] Proper folder structure
- [x] Error handling & status codes
- [x] Form validation (frontend + backend)
- [x] No hardcoded data
- [x] Ready for deployment (Render)
