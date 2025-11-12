# 📊 Admin Dashboard - User Guide

## ✨ Overview

The Admin Dashboard is a comprehensive management interface for administrators and staff to manage the Eliana Beauty booking system.

---

## 🔐 Access

### Who Can Access?
- **ADMIN**: Full access to all features
- **STAFF**: Access to relevant features (appointments, clients)
- **CLIENT**: No access (redirected to home)

### How to Access?
1. Login with an admin or staff account
2. Look for the **⚙️ Admin** button in the top navigation
3. Click to enter the dashboard

### Default Admin Account
```
Email: admin@eliana.beauty
Password: admin123
```

---

## 📱 Dashboard Features

### 1. **Dashboard Overview** (`/admin`)

#### Stats Cards
- **Today's Appointments**: Number of appointments scheduled for today
- **This Week**: Total appointments this week
- **This Month**: Total appointments this month
- **Month Revenue**: Total revenue from completed appointments
- **Total Clients**: Number of registered clients
- **Active Staff**: Number of active staff members

#### Recent Appointments
- Shows the last 10 appointments
- Displays client, service, date/time, and status
- Quick view of appointment details

#### Popular Services
- Top 5 most booked services
- Shows booking count and service details
- Helps identify trending services

#### Quick Actions
- Fast navigation to key sections
- One-click access to:
  - View Appointments
  - Manage Clients
  - Edit Services
  - Manage Staff

---

### 2. **Appointments Management** (`/admin/appointments`)

#### Features
✅ **View All Appointments**
- Complete list of all bookings
- Table format with full details

✅ **Filters**
- Filter by status (Pending, Confirmed, Completed, Cancelled, No Show)
- Filter by date
- Clear filters button

✅ **Status Summary**
- Quick count of appointments by status
- Visual cards for each status type

✅ **Appointment Details**
Each appointment shows:
- Client information (name, email, phone)
- Service details (name, duration, price)
- Staff assignment
- Date and time (start/end)
- Current status

✅ **Status Management**
- Dropdown to change appointment status
- Options:
  - **PENDING**: Initial state
  - **CONFIRMED**: Approved by admin/staff
  - **COMPLETED**: Service finished
  - **CANCELLED**: Booking cancelled
  - **NO_SHOW**: Client didn't show up

---

### 3. **Clients Management** (`/admin/clients`)

#### Features
✅ **Client Cards**
- Grid layout with client cards
- Beautiful, modern design

✅ **Search**
- Search by name, email, or phone
- Real-time filtering

✅ **Stats**
- Total clients count
- Active clients count

✅ **Client Information**
Each card shows:
- Name with initial avatar
- Email address
- Phone number (if provided)
- Language preference (EN/HE)
- Join date
- Active/Inactive status
- Recent appointments (last 3)

✅ **Appointment History**
- View client's recent bookings
- See status of each appointment
- Quick glance at client activity

---

### 4. **Services Management** (`/admin/services`)

**Status**: Coming Soon
- CRUD for services
- Category management
- Pricing updates
- Image uploads

---

### 5. **Staff Management** (`/admin/staff`)

**Status**: Coming Soon
- Add/edit staff members
- Assign services
- Manage working hours
- Handle time-off requests

---

## 🎨 UI/UX Features

### Sidebar Navigation
- Fixed left sidebar
- Active page highlighting
- Icon-based menu items
- Quick access to all sections

### Top Bar
- Page title display
- Current date display
- Clean, professional look

### User Info
- Shows logged-in user
- Displays role (ADMIN/STAFF)
- Avatar with initials

### Color Coding
- **Green**: Confirmed, Active, Positive
- **Yellow**: Pending, Waiting
- **Red**: Cancelled, Inactive, Negative
- **Blue**: Completed, Informational
- **Gray**: No Show, Neutral

### Responsive Design
- Works on desktop and tablets
- Sidebar is fixed on larger screens
- Tables scroll horizontally on smaller screens

---

## 🚀 Usage Examples

### Example 1: Confirm a Pending Appointment

1. Go to **Appointments** page
2. Find the pending appointment
3. In the "Actions" column, select **CONFIRMED** from dropdown
4. Status updates automatically
5. Client will see the confirmation

### Example 2: Search for a Specific Client

1. Go to **Clients** page
2. Use the search bar at the top
3. Type client's name, email, or phone
4. Results filter in real-time
5. View client's appointment history

### Example 3: View Today's Schedule

1. Go to **Appointments** page
2. Click on the date filter
3. Select today's date
4. View all appointments for today
5. Update statuses as services are completed

### Example 4: Check Monthly Revenue

1. Go to **Dashboard** page
2. Look at the "Month Revenue" card
3. See total revenue from completed appointments
4. View popular services contributing to revenue

---

## 📊 API Endpoints Used

### Dashboard
```
GET /admin/dashboard
```
Returns: stats, recent appointments, popular services

### Appointments
```
GET /admin/appointments?status=...&date=...
PATCH /admin/appointments/:id/status
```

### Clients
```
GET /admin/clients
```

---

## 🔒 Security

### Protected Routes
- All admin routes require authentication
- Role-based access control (RBAC)
- JWT token validation on every request

### Authorization
- Admin: Full access
- Staff: Limited to appointments and clients
- Client: No access (redirected)

### Data Protection
- Sensitive client data properly secured
- No passwords exposed
- Email and phone visible only to authorized users

---

## 💡 Tips & Best Practices

### For Daily Use
1. **Start with Dashboard** - Quick overview of today's activity
2. **Check Pending Appointments** - Confirm or follow up
3. **Monitor No-Shows** - Track patterns and follow up
4. **Review Popular Services** - Understand client preferences

### For Efficiency
1. **Use Filters** - Quickly find specific appointments
2. **Status Updates** - Keep appointments up to date
3. **Search Clients** - Fast access to client info
4. **Quick Actions** - Use dashboard shortcuts

### For Business Insights
1. **Track Revenue** - Monitor monthly performance
2. **Analyze Bookings** - Identify busy periods
3. **Review Cancellations** - Understand why clients cancel
4. **Popular Services** - Focus marketing on trending services

---

## 🎯 Future Enhancements

Planned features (not yet implemented):

### Short Term
- [ ] Calendar view for appointments
- [ ] Service CRUD operations
- [ ] Staff management interface
- [ ] Bulk status updates
- [ ] Export data (CSV, PDF)

### Medium Term
- [ ] Analytics charts and graphs
- [ ] Email notifications from dashboard
- [ ] SMS reminders
- [ ] Client notes and history
- [ ] Staff performance metrics

### Long Term
- [ ] Advanced analytics
- [ ] Revenue forecasting
- [ ] Automated scheduling
- [ ] Integration with accounting software
- [ ] Mobile app for staff

---

## 🐛 Troubleshooting

### Can't Access Admin Dashboard
**Problem**: "Admin" button not showing
**Solution**:
- Ensure you're logged in
- Check your account role (must be ADMIN or STAFF)
- Contact admin if you need role upgrade

### Dashboard Not Loading
**Problem**: Stats not displaying
**Solution**:
- Check API is running (http://localhost:3001)
- Check browser console for errors
- Refresh the page
- Clear browser cache

### Status Update Not Working
**Problem**: Appointment status doesn't change
**Solution**:
- Check you have permission
- Ensure appointment ID is valid
- Check API logs for errors
- Try refreshing the page

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API logs: `pnpm --filter api dev`
3. Check browser console for errors
4. Verify database connection

---

## 🎉 Success!

You now have a fully functional admin dashboard to manage your beauty salon business efficiently!

**Key Benefits:**
- ✅ Centralized management
- ✅ Real-time updates
- ✅ Beautiful, modern interface
- ✅ Role-based access
- ✅ Mobile-friendly design

**Start managing your business like a pro! 💼**
