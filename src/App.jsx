
import React, { useState, useEffect, useCallback } from 'react';
// Assume Font Awesome or similar icon library is linked in public/index.html
// e.g., <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

// --- I. ABSOLUTE UI/UX LAWS & ELITE AESTHETICS ---
// Light-Theme First: Handled in App.css and component styling.
// Card-First + Click-Through UX: Implemented with `Card` components and `onClick`.
// Interactivity: Every card will have an `onClick` handler.
// Colorful System: Status mapping and styling in `App.css` and `getStatusStyles` helper.
// Full-Screen Navigation: `setView` updates the main content area, simulating full-screen.
// Appian Record Alignment: `OrderDetail` component structure.
// Elite Aesthetics: Glassmorphism, soft shadows, elevated cards are in `App.css`.
// Intelligence: Trend indicators on KPI cards, dynamic visuals are represented.

// --- II. STRICT ENGINEERING & ERROR PREVENTION RULES ---
// Light-Mode Variables: Defined in App.css.
// JSX Style Syntax: Used throughout, e.g., `style={{ marginBottom: 'var(--spacing-md)' }}`.
// Export Pattern: `export default App;` at the end.
// Scope & Reference: Handlers are defined within components or passed down.
// Null Safety: Optional chaining `?.` used for data access.
// State Immutability: Functional updates with spread operator.
// Centralized Routing: `const [view, setView] = useState({ screen: 'DASHBOARD', params: {} })`.
// RBAC Logic: `ROLES` configuration and `currentUserRole` state.

// --- Sample Data ---
const USERS = {
  admin: { id: 'adm1', name: 'Admin User', role: 'Admin', initials: 'AU' },
  customer: { id: 'cust1', name: 'John Doe', role: 'Customer', initials: 'JD' },
  serviceProvider: { id: 'sp1', name: 'Ironing Partner A', role: 'Service Provider', initials: 'IPA' },
};

const ROLES = {
  Admin: ['DASHBOARD', 'ORDERS', 'ORDER_DETAIL', 'ORDER_FORM_ADMIN', 'PARTNERS', 'RATES', 'ANALYTICS'],
  Customer: ['DASHBOARD', 'ORDERS', 'ORDER_DETAIL', 'ORDER_FORM_CUSTOMER'],
  'Service Provider': ['DASHBOARD', 'ORDERS', 'ORDER_DETAIL', 'ORDER_FORM_SP'],
};

const SAMPLE_ORDERS = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    status: 'Ready',
    deliveryOption: 'Doorstep',
    items: [{ type: 'Shirt', qty: 5 }, { type: 'Pants', qty: 3 }],
    totalPrice: 120.00,
    placedDate: '2023-10-26T10:00:00Z',
    acceptedDate: '2023-10-26T11:30:00Z',
    ironingDate: '2023-10-27T09:00:00Z',
    readyDate: '2023-10-27T15:00:00Z',
    deliveredDate: null,
    pickupDate: '2023-10-28T10:00:00Z',
    partner: 'Ironing Partner A',
    timeline: [
      { status: 'Created', date: '2023-10-26T10:00:00Z', user: 'John Doe', remark: 'Order placed online' },
      { status: 'Accepted', date: '2023-10-26T11:30:00Z', user: 'Ironing Partner A', remark: 'Order accepted' },
      { status: 'Ironing', date: '2023-10-27T09:00:00Z', user: 'Ironing Partner A', remark: 'Processing started', slaBreach: false },
      { status: 'Ready', date: '2023-10-27T15:00:00Z', user: 'Ironing Partner A', remark: 'Ready for pickup/delivery', slaBreach: false },
    ],
    auditLog: [
      { timestamp: '2023-10-26T10:00:00Z', user: 'John Doe', action: 'Order Created', details: 'Order initiated for 8 items' },
      { timestamp: '2023-10-26T10:05:00Z', user: 'System', action: 'Delivery Option Set', details: 'Doorstep delivery selected' },
      { timestamp: '2023-10-26T11:30:00Z', user: 'Ironing Partner A', action: 'Order Status Change', details: 'Status changed from Created to Accepted' },
      { timestamp: '2023-10-27T09:00:00Z', user: 'Ironing Partner A', action: 'Order Status Change', details: 'Status changed from Accepted to Ironing' },
      { timestamp: '2023-10-27T15:00:00Z', user: 'Ironing Partner A', action: 'Order Status Change', details: 'Status changed from Ironing to Ready' },
    ],
    documents: [{ name: 'Order Invoice.pdf', url: '/docs/invoice-001.pdf', type: 'PDF' }],
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    status: 'In Progress',
    deliveryOption: 'Customer Pickup',
    items: [{ type: 'Dress', qty: 2 }, { type: 'Scarf', qty: 4 }],
    totalPrice: 95.00,
    placedDate: '2023-10-25T14:00:00Z',
    acceptedDate: '2023-10-25T15:00:00Z',
    ironingDate: '2023-10-26T10:00:00Z',
    readyDate: null,
    deliveredDate: null,
    pickupDate: null,
    partner: 'Ironing Partner B',
    timeline: [
      { status: 'Created', date: '2023-10-25T14:00:00Z', user: 'Jane Smith', remark: 'Order placed' },
      { status: 'Accepted', date: '2023-10-25T15:00:00Z', user: 'Ironing Partner B', remark: 'Order accepted' },
      { status: 'Ironing', date: '2023-10-26T10:00:00Z', user: 'Ironing Partner B', remark: 'Processing in progress', slaBreach: true },
    ],
    auditLog: [
      { timestamp: '2023-10-25T14:00:00Z', user: 'Jane Smith', action: 'Order Created', details: 'Order initiated for 6 items' },
      { timestamp: '2023-10-25T14:05:00Z', user: 'System', action: 'Delivery Option Set', details: 'Customer Pickup selected' },
      { timestamp: '2023-10-25T15:00:00Z', user: 'Ironing Partner B', action: 'Order Status Change', details: 'Status changed from Created to Accepted' },
      { timestamp: '2023-10-26T10:00:00Z', user: 'Ironing Partner B', action: 'Order Status Change', details: 'Status changed from Accepted to Ironing' },
    ],
    documents: [],
  },
  {
    id: 'ORD-003',
    customerName: 'Alice Brown',
    status: 'Pending',
    deliveryOption: 'Doorstep',
    items: [{ type: 'Towel', qty: 10 }],
    totalPrice: 80.00,
    placedDate: '2023-10-28T09:00:00Z',
    acceptedDate: null,
    ironingDate: null,
    readyDate: null,
    deliveredDate: null,
    pickupDate: null,
    partner: null,
    timeline: [
      { status: 'Created', date: '2023-10-28T09:00:00Z', user: 'Alice Brown', remark: 'New order awaiting acceptance' },
    ],
    auditLog: [
      { timestamp: '2023-10-28T09:00:00Z', user: 'Alice Brown', action: 'Order Created', details: 'Order initiated for 10 items' },
      { timestamp: '2023-10-28T09:05:00Z', user: 'System', action: 'Delivery Option Set', details: 'Doorstep delivery selected' },
    ],
    documents: [],
  },
  {
    id: 'ORD-004',
    customerName: 'Robert Green',
    status: 'Delivered',
    deliveryOption: 'Doorstep',
    items: [{ type: 'Suit', qty: 1 }],
    totalPrice: 75.00,
    placedDate: '2023-10-20T11:00:00Z',
    acceptedDate: '2023-10-20T12:00:00Z',
    ironingDate: '2023-10-21T08:00:00Z',
    readyDate: '2023-10-21T14:00:00Z',
    deliveredDate: '2023-10-22T10:00:00Z',
    pickupDate: null,
    partner: 'Ironing Partner C',
    timeline: [
      { status: 'Created', date: '2023-10-20T11:00:00Z', user: 'Robert Green', remark: 'Order placed' },
      { status: 'Accepted', date: '2023-10-20T12:00:00Z', user: 'Ironing Partner C', remark: 'Order accepted' },
      { status: 'Ironing', date: '2023-10-21T08:00:00Z', user: 'Ironing Partner C', remark: 'Processing started' },
      { status: 'Ready', date: '2023-10-21T14:00:00Z', user: 'Ironing Partner C', remark: 'Ready for delivery' },
      { status: 'Delivered', date: '2023-10-22T10:00:00Z', user: 'Delivery Partner', remark: 'Order delivered', slaBreach: false },
    ],
    auditLog: [
      { timestamp: '2023-10-20T11:00:00Z', user: 'Robert Green', action: 'Order Created', details: 'Order initiated for 1 item' },
      { timestamp: '2023-10-20T11:05:00Z', user: 'System', action: 'Delivery Option Set', details: 'Doorstep delivery selected' },
      { timestamp: '2023-10-20T12:00:00Z', user: 'Ironing Partner C', action: 'Order Status Change', details: 'Status changed from Created to Accepted' },
      { timestamp: '2023-10-21T08:00:00Z', user: 'Ironing Partner C', action: 'Order Status Change', details: 'Status changed from Accepted to Ironing' },
      { timestamp: '2023-10-21T14:00:00Z', user: 'Ironing Partner C', action: 'Order Status Change', details: 'Status changed from Ironing to Ready' },
      { timestamp: '2023-10-22T10:00:00Z', user: 'Delivery Partner', action: 'Order Status Change', details: 'Status changed from Ready to Delivered' },
    ],
    documents: [],
  },
  {
    id: 'ORD-005',
    customerName: 'Eve White',
    status: 'Rejected',
    deliveryOption: 'Customer Pickup',
    items: [{ type: 'Curtain', qty: 2 }],
    totalPrice: 150.00,
    placedDate: '2023-10-27T16:00:00Z',
    acceptedDate: null,
    ironingDate: null,
    readyDate: null,
    deliveredDate: null,
    pickupDate: null,
    partner: 'Ironing Partner D',
    timeline: [
      { status: 'Created', date: '2023-10-27T16:00:00Z', user: 'Eve White', remark: 'Order placed' },
      { status: 'Rejected', date: '2023-10-27T17:00:00Z', user: 'Ironing Partner D', remark: 'Service not available for item type' },
    ],
    auditLog: [
      { timestamp: '2023-10-27T16:00:00Z', user: 'Eve White', action: 'Order Created', details: 'Order initiated for 2 items' },
      { timestamp: '2023-10-27T16:05:00Z', user: 'System', action: 'Delivery Option Set', details: 'Customer Pickup selected' },
      { timestamp: '2023-10-27T17:00:00Z', user: 'Ironing Partner D', action: 'Order Status Change', details: 'Status changed from Created to Rejected' },
    ],
    documents: [],
  },
];

const SAMPLE_PARTNERS = [
  { id: 'PTN-001', name: 'Ironing Partner A', status: 'Active', contact: 'partnerA@example.com', ordersCompleted: 150, avgRating: 4.8 },
  { id: 'PTN-002', name: 'Ironing Partner B', status: 'Active', contact: 'partnerB@example.com', ordersCompleted: 80, avgRating: 4.5 },
  { id: 'PTN-003', name: 'Ironing Partner C', status: 'Active', contact: 'partnerC@example.com', ordersCompleted: 200, avgRating: 4.9 },
  { id: 'PTN-004', name: 'Ironing Partner D', status: 'Inactive', contact: 'partnerD@example.com', ordersCompleted: 30, avgRating: 3.9 },
];

const SAMPLE_RATES = [
  { id: 'RATE-001', itemType: 'Shirt', pricePerItem: 15.00, lastUpdated: '2023-09-01' },
  { id: 'RATE-002', itemType: 'Pants', pricePerItem: 20.00, lastUpdated: '2023-09-01' },
  { id: 'RATE-003', itemType: 'Dress', pricePerItem: 35.00, lastUpdated: '2023-09-15' },
];

const ACTIVITIES = {
  Customer: [
    { id: 'ACT-001', type: 'Order Placed', ref: 'ORD-003', details: 'Order for 10 Towels', timestamp: '2023-10-28T09:00:00Z', status: 'pending' },
    { id: 'ACT-002', type: 'Order Ready', ref: 'ORD-001', details: 'Order ORD-001 ready for pickup', timestamp: '2023-10-27T15:00:00Z', status: 'approved' },
    { id: 'ACT-003', type: 'Delivery Scheduled', ref: 'ORD-004', details: 'ORD-004 delivery on 2023-10-22', timestamp: '2023-10-21T16:00:00Z', status: 'in-progress' },
  ],
  'Service Provider': [
    { id: 'ACT-004', type: 'Order Accepted', ref: 'ORD-003', details: 'New order ORD-003 assigned to you', timestamp: '2023-10-28T09:30:00Z', status: 'in-progress' },
    { id: 'ACT-005', type: 'Order Completed', ref: 'ORD-001', details: 'ORD-001 marked as ready', timestamp: '2023-10-27T15:00:00Z', status: 'approved' },
    { id: 'ACT-006', type: 'Delivery Completed', ref: 'ORD-004', details: 'ORD-004 delivered to customer', timestamp: '2023-10-22T10:00:00Z', status: 'approved' },
  ],
  Admin: [
    { id: 'ACT-007', type: 'New Partner Setup', ref: 'PTN-005', details: 'New partner "Speedy Iron" registered', timestamp: '2023-10-28T10:00:00Z', status: 'approved' },
    { id: 'ACT-008', type: 'Pricing Update', ref: 'RATE-004', details: 'New rate for "Curtains" added', timestamp: '2023-10-27T14:00:00Z', status: 'approved' },
    ...[...ACTIVITIES.Customer, ...ACTIVITIES['Service Provider']].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3)
  ],
};

// --- Helper Functions (e.g., for styling) ---
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'ready':
    case 'delivered':
    case 'picked':
    case 'active':
      return { backgroundColor: 'var(--status-approved-bg)', borderColor: 'var(--status-approved-border)', color: 'var(--status-approved-text)' };
    case 'in progress':
    case 'ironing':
      return { backgroundColor: 'var(--status-in-progress-bg)', borderColor: 'var(--status-in-progress-border)', color: 'var(--status-in-progress-text)' };
    case 'pending':
    case 'created':
    case 'new':
      return { backgroundColor: 'var(--status-pending-bg)', borderColor: 'var(--status-pending-border)', color: 'var(--status-pending-text)' };
    case 'rejected':
    case 'inactive':
      return { backgroundColor: 'var(--status-rejected-bg)', borderColor: 'var(--status-rejected-border)', color: 'var(--status-rejected-text)' };
    case 'exception':
      return { backgroundColor: 'var(--status-exception-bg)', borderColor: 'var(--status-exception-border)', color: 'var(--status-exception-text)' };
    default:
      return { backgroundColor: 'var(--color-light-gray)', borderColor: 'var(--color-subtle-text)', color: 'var(--color-subtle-text)' };
  }
};

const formatCurrency = (amount) => `₹${amount?.toFixed(2)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

// --- Components ---

const NavBar = ({ currentUserRole, navigate, currentScreen }) => {
  const navItems = {
    Admin: [
      { id: 'DASHBOARD', label: 'Dashboard', icon: 'fas fa-chart-line' },
      { id: 'ORDERS', label: 'Orders', icon: 'fas fa-box' },
      { id: 'PARTNERS', label: 'Partners', icon: 'fas fa-handshake' },
      { id: 'RATES', label: 'Rates', icon: 'fas fa-tags' },
      { id: 'ANALYTICS', label: 'Analytics', icon: 'fas fa-chart-area' },
    ],
    Customer: [
      { id: 'DASHBOARD', label: 'My Dashboard', icon: 'fas fa-chart-line' },
      { id: 'ORDERS', label: 'My Orders', icon: 'fas fa-box' },
      { id: 'ORDER_FORM_CUSTOMER', label: 'Place New Order', icon: 'fas fa-plus-circle' },
    ],
    'Service Provider': [
      { id: 'DASHBOARD', label: 'My Dashboard', icon: 'fas fa-chart-line' },
      { id: 'ORDERS', label: 'Order Queue', icon: 'fas fa-list-alt' },
      { id: 'ORDER_FORM_SP', label: 'Update Order', icon: 'fas fa-pen-to-square' }, // Placeholder for order update
    ],
  };

  const allowedNavItems = navItems[currentUserRole] || [];

  return (
    <nav className="nav-bar">
      <div className="nav-logo">IronEclipse</div>
      <ul className="nav-list">
        {allowedNavItems.map(item => (
          <li key={item.id} className="nav-item">
            <a
              href="#!"
              className={`nav-link ${currentScreen === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Header = ({ currentUser, onSearchClick, onNotificationsClick, title }) => (
  <header className="header">
    <div className="header-title">{title}</div>
    <div className="header-actions">
      <button className="icon-button" onClick={onSearchClick} aria-label="Global Search">
        <i className="fas fa-search"></i>
      </button>
      <button className="icon-button" onClick={onNotificationsClick} aria-label="Notifications">
        <i className="fas fa-bell"></i>
      </button>
      <div className="user-avatar" title={currentUser?.name}>{currentUser?.initials}</div>
    </div>
  </header>
);

const KPICard = ({ icon, value, label, statusText, trendIndicator, onClick }) => (
  <div className="card kpi-card" onClick={onClick}>
    <i className={`${icon} kpi-card-icon`}></i>
    <div className="kpi-card-value">{value}</div>
    <div className="kpi-card-label">{label}</div>
    {statusText && (
      <div className="kpi-card-status" style={getStatusStyles(statusText)}>
        {statusText} {trendIndicator && <i className={`fas ${trendIndicator === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>}
      </div>
    )}
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="chart-container">
    <h3 className="chart-title">{title}</h3>
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Placeholder for actual chart component */}
      {children || <div style={{ color: 'var(--color-subtle-text)' }}>Chart data will be rendered here.</div>}
    </div>
  </div>
);

const RecentActivityFeed = ({ activities, title }) => (
  <div className="card">
    <h3 className="detail-card-title">{title}</h3>
    <div className="activity-feed">
      {activities?.map(activity => (
        <div key={activity.id} className="activity-item">
          <i className="fas fa-circle-info activity-icon"></i>
          <div className="activity-details">
            <div className="activity-text">{activity.type}: <strong>{activity.ref}</strong> - {activity.details}</div>
            <div className="activity-timestamp">{formatDate(activity.timestamp)}</div>
          </div>
          <div className="status-tag" style={getStatusStyles(activity.status)}>{activity.status}</div>
        </div>
      ))}
      {activities?.length === 0 && <p style={{ color: 'var(--color-subtle-text)' }}>No recent activities.</p>}
    </div>
  </div>
);

const GlobalSearchOverlay = ({ isOpen, onClose, onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      const filteredOrders = SAMPLE_ORDERS.filter(order =>
        order.id.toLowerCase().includes(term.toLowerCase()) ||
        order.customerName.toLowerCase().includes(term.toLowerCase()) ||
        order.status.toLowerCase().includes(term.toLowerCase())
      ).map(order => ({
        id: order.id,
        title: `Order ${order.id}`,
        meta: `Customer: ${order.customerName}, Status: ${order.status}`,
        type: 'ORDER',
        params: { orderId: order.id }
      }));
      // Add more search logic for partners, rates etc. here
      setSearchResults(filteredOrders);
    } else {
      setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={e => e.stopPropagation()}>
        <div className="search-input-group">
          <i className="fas fa-search" style={{ margin: '0 var(--spacing-sm)', color: 'var(--color-subtle-text)' }}></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search orders, customers, partners..."
            value={searchTerm}
            onChange={handleSearch}
            autoFocus
          />
          <button className="icon-button" onClick={onClose} aria-label="Close Search">
            <i className="fas fa-times"></i>
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(result => (
              <div key={result.id} className="search-result-item" onClick={() => onSelectResult(result.type, result.params)}>
                <div className="search-result-title">{result.title}</div>
                <div className="search-result-meta">{result.meta}</div>
              </div>
            ))}
          </div>
        )}
        {searchTerm.length > 2 && searchResults.length === 0 && (
          <div className="text-center" style={{ color: 'var(--color-subtle-text)' }}>No results found.</div>
        )}
      </div>
    </div>
  );
};

const NotificationToast = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  let iconClass = 'fas fa-info-circle';
  switch (notification.severity) {
    case 'success': iconClass = 'fas fa-check-circle'; break;
    case 'warning': iconClass = 'fas fa-exclamation-triangle'; break;
    case 'error': iconClass = 'fas fa-times-circle'; break;
    default: break;
  }

  return (
    <div className={`notification-toast ${notification.severity}`}>
      <i className={`${iconClass} notification-icon`}></i>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
      </div>
      <button className="icon-button" onClick={() => onClose(notification.id)}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

const OrderCard = ({ order, onClick, currentUserRole, onAccept, onMarkReady, onMarkDelivered }) => {
  const statusColors = getStatusStyles(order.status);
  const canAccept = currentUserRole === 'Service Provider' && order.status === 'Pending';
  const canMarkReady = currentUserRole === 'Service Provider' && order.status === 'In Progress';
  const canMarkDelivered = currentUserRole === 'Service Provider' && order.status === 'Ready' && order.deliveryOption === 'Doorstep';
  const canMarkPicked = currentUserRole === 'Service Provider' && order.status === 'Ready' && order.deliveryOption === 'Customer Pickup';

  return (
    <div className="order-card" onClick={() => onClick(order.id)}>
      <div className="order-card-header">
        <span className="order-id">{order.id}</span>
        <span className="status-tag" style={statusColors}>{order.status}</span>
      </div>
      <div className="order-details-row">
        <span>Customer:</span>
        <span>{order.customerName}</span>
      </div>
      <div className="order-details-row">
        <span>Delivery:</span>
        <span className="order-delivery-option">{order.deliveryOption}</span>
      </div>
      <div className="order-details-row">
        <span>Items:</span>
        <span>{order.items?.map(i => `${i.qty} ${i.type}`).join(', ')}</span>
      </div>
      <div className="order-card-actions" onClick={e => e.stopPropagation()}>
        {canAccept && <button className="order-card-action-button" onClick={() => onAccept(order.id)}>Accept</button>}
        {canMarkReady && <button className="order-card-action-button" onClick={() => onMarkReady(order.id)}>Mark Ready</button>}
        {canMarkDelivered && <button className="order-card-action-button" onClick={() => onMarkDelivered(order.id, 'Delivered')}>Mark Delivered</button>}
        {canMarkPicked && <button className="order-card-action-button" onClick={() => onMarkDelivered(order.id, 'Picked')}>Mark Picked</button>}
      </div>
    </div>
  );
};

const Dashboard = ({ currentUserRole, navigate, notifications, addNotification }) => {
  const customerKPIs = [
    { icon: 'fas fa-clipboard-list', value: SAMPLE_ORDERS.filter(o => o.customerName === currentUser?.name).length, label: 'Orders Placed', statusText: 'Total', trendIndicator: 'up' },
    { icon: 'fas fa-check-circle', value: SAMPLE_ORDERS.filter(o => o.customerName === currentUser?.name && o.status === 'Ready').length, label: 'Orders Ready', statusText: 'Ready', trendIndicator: 'up' },
  ];

  const serviceProviderKPIs = [
    { icon: 'fas fa-bell', value: SAMPLE_ORDERS.filter(o => o.partner === currentUser?.name && o.status === 'Pending').length, label: 'Orders Received', statusText: 'Pending', trendIndicator: 'up' },
    { icon: 'fas fa-sync-alt', value: SAMPLE_ORDERS.filter(o => o.partner === currentUser?.name && o.status === 'In Progress').length, label: 'Orders In Progress', statusText: 'In Progress', trendIndicator: 'up' },
    { icon: 'fas fa-boxes', value: SAMPLE_ORDERS.filter(o => o.partner === currentUser?.name && (o.status === 'Ready' || o.status === 'Delivered')).length, label: 'Orders Completed', statusText: 'Completed', trendIndicator: 'up' },
    { icon: 'fas fa-truck', value: SAMPLE_ORDERS.filter(o => o.partner === currentUser?.name && o.status === 'Ready' && o.deliveryOption === 'Doorstep').length, label: 'Deliveries Scheduled', statusText: 'Scheduled', trendIndicator: 'up' },
  ];

  const adminKPIs = [
    { icon: 'fas fa-box-open', value: SAMPLE_ORDERS.length, label: 'Total Orders', statusText: 'All', trendIndicator: 'up' },
    { icon: 'fas fa-rupee-sign', value: formatCurrency(SAMPLE_ORDERS.reduce((acc, order) => acc + (order.totalPrice || 0), 0)), label: 'Total Revenue', statusText: 'Revenue', trendIndicator: 'up' },
    { icon: 'fas fa-clock', value: '24h', label: 'Avg Turnaround Time', statusText: 'SLA', trendIndicator: 'down' },
    { icon: 'fas fa-truck-loading', value: `${SAMPLE_ORDERS.filter(o => o.deliveryOption === 'Doorstep').length} / ${SAMPLE_ORDERS.filter(o => o.deliveryOption === 'Customer Pickup').length}`, label: 'Delivery vs Pickup', statusText: 'Mix', trendIndicator: 'up' },
  ];

  const getKPIs = () => {
    switch (currentUserRole) {
      case 'Customer': return customerKPIs;
      case 'Service Provider': return serviceProviderKPIs;
      case 'Admin': return adminKPIs;
      default: return [];
    }
  };

  const currentActivities = ACTIVITIES[currentUserRole] || [];

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>{currentUserRole} Dashboard</h2>

      <div className="card-grid">
        {getKPIs().map((kpi, index) => (
          <KPICard key={index} {...kpi} onClick={() => {
            if (kpi.label.includes('Orders') && kpi.label !== 'Orders Ready') {
                navigate('ORDERS'); // Example drill down
            }
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <div className="flex-column gap-md">
          {currentUserRole === 'Admin' && (
            <ChartContainer title="Revenue Trend (Admin)">
              <img src="https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Revenue',data:[50,60,70,80,90,100],fill:false,borderColor:'rgb(217, 58, 169)'}]}}" alt="Revenue Trend Chart" style={{maxWidth: '100%', height: 'auto'}} />
            </ChartContainer>
          )}
          {currentUserRole === 'Service Provider' && (
            <ChartContainer title="Orders by Status (Service Provider)">
              <img src="https://quickchart.io/chart?c={type:'bar',data:{labels:['Pending','In Progress','Ready','Delivered'],datasets:[{label:'Orders',data:[5,12,8,20],backgroundColor:['#FFC107','#17A2B8','#28A745','#047857']}]}}" alt="Orders by Status Chart" style={{maxWidth: '100%', height: 'auto'}} />
            </ChartContainer>
          )}
          {currentUserRole === 'Customer' && (
            <ChartContainer title="My Order Status (Customer)">
              <img src="https://quickchart.io/chart?c={type:'doughnut',data:{labels:['Created','In Progress','Ready','Delivered'],datasets:[{data:[1,1,1,1],backgroundColor:['#FFC107','#17A2B8','#28A745','#047857']}]}}" alt="Customer Order Status Chart" style={{maxWidth: '100%', height: 'auto'}} />
            </ChartContainer>
          )}
        </div>
        <RecentActivityFeed activities={currentActivities} title="Recent Activities" />
      </div>

      {currentUserRole === 'Admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
            <ChartContainer title="Avg Turnaround Time (Admin)">
              <img src="https://quickchart.io/chart?c={type:'gauge',data:{datasets:[{value:75,minValue:0,maxValue:100,backgroundColor:'rgb(217, 58, 169)',borderWidth:0}],labels:['TAT']}}" alt="TAT Gauge Chart" style={{maxWidth: '100%', height: 'auto'}} />
            </ChartContainer>
            <ChartContainer title="Delivery vs Pickup (Admin)">
              <img src="https://quickchart.io/chart?c={type:'doughnut',data:{labels:['Doorstep','Pickup'],datasets:[{data:[3,2],backgroundColor:['#047857','#17A2B8']}]}}" alt="Delivery vs Pickup Chart" style={{maxWidth: '100%', height: 'auto'}} />
            </ChartContainer>
        </div>
      )}
    </div>
  );
};

const OrdersView = ({ currentUserRole, navigate, orders, updateOrderStatus, currentUser }) => {
  const [filters, setFilters] = useState({ date: '', status: '', deliveryOption: '', partner: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm ?
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : true;

    const matchesStatus = filters.status ? order.status?.toLowerCase() === filters.status.toLowerCase() : true;
    const matchesDelivery = filters.deliveryOption ? order.deliveryOption?.toLowerCase() === filters.deliveryOption.toLowerCase() : true;
    const matchesPartner = filters.partner ? order.partner?.toLowerCase() === filters.partner.toLowerCase() : true;

    // Date filter logic would go here, more complex, omitting for brevity.

    return matchesSearch && matchesStatus && matchesDelivery && matchesPartner;
  }).filter(order => {
    // Role-based filtering
    if (currentUserRole === 'Customer') return order.customerName === currentUser?.name;
    if (currentUserRole === 'Service Provider') return order.partner === currentUser?.name || order.status === 'Pending'; // SP sees their orders + unassigned pending
    return true; // Admin sees all
  });

  const handleOrderAction = (orderId, actionType, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus };
        // Add to timeline/audit log
        updatedOrder.timeline = [...(updatedOrder.timeline || []), {
          status: newStatus,
          date: new Date().toISOString(),
          user: currentUser?.name,
          remark: `Order ${actionType.toLowerCase()}`,
        }];
        updatedOrder.auditLog = [...(updatedOrder.auditLog || []), {
          timestamp: new Date().toISOString(),
          user: currentUser?.name,
          action: 'Order Status Change',
          details: `Status changed to ${newStatus}`,
        }];
        return updatedOrder;
      }
      return order;
    });
    updateOrderStatus(updatedOrders);
    navigate('ORDER_DETAIL', { orderId });
  };

  const partners = [...new Set(orders.map(o => o.partner).filter(Boolean))];
  const orderStatuses = [...new Set(orders.map(o => o.status).filter(Boolean))];
  const deliveryOptions = [...new Set(orders.map(o => o.deliveryOption).filter(Boolean))];

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>{currentUserRole === 'Customer' ? 'My Orders' : currentUserRole === 'Service Provider' ? 'Order Queue' : 'All Orders'}</h2>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--border-radius-sm)' }}
        />
        {(currentUserRole === 'Customer' || currentUserRole === 'Service Provider' || currentUserRole === 'Admin') && (
          <select name="status" onChange={handleFilterChange} value={filters.status} style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--border-radius-sm)' }}>
            <option value="">All Statuses</option>
            {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        )}
        {(currentUserRole === 'Customer' || currentUserRole === 'Service Provider' || currentUserRole === 'Admin') && (
          <select name="deliveryOption" onChange={handleFilterChange} value={filters.deliveryOption} style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--border-radius-sm)' }}>
            <option value="">All Delivery Options</option>
            {deliveryOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        )}
        {currentUserRole === 'Admin' && (
          <select name="partner" onChange={handleFilterChange} value={filters.partner} style={{ padding: 'var(--spacing-sm)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--border-radius-sm)' }}>
            <option value="">All Partners</option>
            {partners.map(partner => <option key={partner} value={partner}>{partner}</option>)}
          </select>
        )}
        {/* Date filter could be added here */}
      </div>

      <div className="card-grid">
        {filteredOrders?.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={(orderId) => navigate('ORDER_DETAIL', { orderId })}
              currentUserRole={currentUserRole}
              onAccept={() => handleOrderAction(order.id, 'Accepted', 'In Progress')}
              onMarkReady={() => handleOrderAction(order.id, 'Ready', 'Ready')}
              onMarkDelivered={(orderId, status) => handleOrderAction(orderId, status, status)}
            />
          ))
        ) : (
          <div className="card text-center" style={{ gridColumn: '1 / -1', padding: 'var(--spacing-xl)' }}>
            <i className="fas fa-box-open" style={{ fontSize: '48px', color: 'var(--color-subtle-text)', marginBottom: 'var(--spacing-md)' }}></i>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-charcoal-text)' }}>No orders found.</p>
            <p style={{ color: 'var(--color-subtle-text)' }}>Adjust your filters or <a href="#!" onClick={() => navigate('ORDER_FORM_CUSTOMER')} style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>place a new order</a>.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderDetail = ({ order, navigate, updateOrderStatus, currentUserRole, currentUser }) => {
  if (!order) return <div className="detail-page-container"><p>Order not found.</p></div>;

  const handleAction = (actionType, newStatus) => {
    const updatedOrder = { ...order, status: newStatus };
    updatedOrder.timeline = [...(updatedOrder.timeline || []), {
      status: newStatus,
      date: new Date().toISOString(),
      user: currentUser?.name,
      remark: `Order ${actionType.toLowerCase()}`,
    }];
    updatedOrder.auditLog = [...(updatedOrder.auditLog || []), {
      timestamp: new Date().toISOString(),
      user: currentUser?.name,
      action: 'Order Status Change',
      details: `Status changed to ${newStatus}`,
    }];
    updateOrderStatus(updatedOrder);
  };

  const getContextualActions = () => {
    const actions = [];
    if (currentUserRole === 'Service Provider') {
      if (order.status === 'Pending') {
        actions.push({ label: 'Accept Order', handler: () => handleAction('Accepted', 'In Progress'), primary: true });
      } else if (order.status === 'In Progress') {
        actions.push({ label: 'Mark Ready', handler: () => handleAction('Ready', 'Ready'), primary: true });
      } else if (order.status === 'Ready' && order.deliveryOption === 'Doorstep') {
        actions.push({ label: 'Mark Delivered', handler: () => handleAction('Delivered', 'Delivered'), primary: true });
      } else if (order.status === 'Ready' && order.deliveryOption === 'Customer Pickup') {
        actions.push({ label: 'Mark Picked', handler: () => handleAction('Picked', 'Picked'), primary: true });
      }
    }
    // Admin could have edit/cancel actions here
    if (currentUserRole === 'Admin') {
      actions.push({ label: 'Edit Order', handler: () => navigate('ORDER_FORM_ADMIN', { orderId: order.id }), secondary: true });
    }
    return actions;
  };

  const breadcrumbs = [
    { label: 'Orders', path: 'ORDERS' },
    { label: order.id, path: `ORDER_DETAIL` },
  ];

  const milestones = ['Created', 'Accepted', 'Ironing', 'Ready', order.deliveryOption === 'Doorstep' ? 'Delivered' : 'Customer Picked'];

  return (
    <div className="detail-page-container">
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <a href="#!" onClick={() => navigate(crumb.path, crumb.params)}>{crumb.label}</a>
            {index < breadcrumbs.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="summary-header">
        <h2 className="summary-title">Order {order.id}</h2>
        <div className="summary-actions">
          {getContextualActions().map((action, index) => (
            <button key={index} className={`summary-action-button ${action.primary ? 'primary' : 'secondary'}`} onClick={action.handler}>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-sections-grid">
        <div className="detail-main-info">
          <div className="detail-card">
            <h3 className="detail-card-title">Order Information</h3>
            <div className="info-row"><span className="info-label">Customer</span><span className="info-value">{order.customerName}</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className="info-value"><span className="status-tag" style={getStatusStyles(order.status)}>{order.status}</span></span></div>
            <div className="info-row"><span className="info-label">Total Price</span><span className="info-value">{formatCurrency(order.totalPrice)}</span></div>
            <div className="info-row"><span className="info-label">Delivery Option</span><span className="info-value">{order.deliveryOption}</span></div>
            <div className="info-row"><span className="info-label">Ironing Partner</span><span className="info-value">{order.partner || 'Unassigned'}</span></div>
            <div className="info-row"><span className="info-label">Items</span><span className="info-value">{order.items?.map(i => `${i.qty} ${i.type}`).join(', ')}</span></div>
            <div className="info-row"><span className="info-label">Placed Date</span><span className="info-value">{formatDate(order.placedDate)}</span></div>
          </div>

          {(currentUserRole === 'Admin' || (order.documents?.length > 0 && currentUserRole === 'Customer')) && (
            <div className="detail-card">
              <h3 className="detail-card-title">Documents</h3>
              {order.documents?.length > 0 ? (
                order.documents.map(doc => (
                  <div key={doc.name} className="info-row" style={{ alignItems: 'center' }}>
                    <span className="info-label"><i className="fas fa-file-alt" style={{ marginRight: 'var(--spacing-xs)' }}></i>{doc.name}</span>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}><i className="fas fa-eye"></i> Preview</a>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--color-subtle-text)' }}>No documents available.</p>
              )}
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="detail-card">
            <h3 className="detail-card-title">Workflow Progress</h3>
            <div className="milestone-tracker">
              {milestones.map((milestone, index) => {
                const timelineEntry = order.timeline?.find(t => t.status === milestone);
                const isCompleted = !!timelineEntry;
                const isActive = order.status === milestone || (!isCompleted && order.timeline && index === order.timeline.length -1);
                const isSlaBreached = timelineEntry?.slaBreach;

                return (
                  <div key={milestone} className={`milestone-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="milestone-icon-wrapper">
                      <i className={`milestone-icon fas ${isCompleted ? 'fa-check' : 'fa-circle'}`}></i>
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title">
                        {milestone}
                        {isSlaBreached && <span className="sla-badge" title="SLA Breach">SLA breached!</span>}
                      </div>
                      <div className="milestone-date">{timelineEntry ? formatDate(timelineEntry.date) : 'Pending'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(currentUserRole === 'Admin' || currentUserRole === 'Service Provider') && (
            <div className="detail-card">
              <h3 className="detail-card-title">Audit Feed</h3>
              <div className="audit-feed">
                {order.auditLog?.map((log, index) => (
                  <div key={index} className="audit-feed-item">
                    <i className="fas fa-history audit-icon"></i>
                    <div className="audit-details">
                      <div className="audit-message"><strong>{log.action}</strong>: {log.details}</div>
                      <div className="audit-timestamp-user">{formatDate(log.timestamp)} by {log.user}</div>
                    </div>
                  </div>
                ))}
                {order.auditLog?.length === 0 && <p style={{ color: 'var(--color-subtle-text)' }}>No audit history.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderForm = ({ navigate, currentUserRole, onSubmit, orderToEdit, addNotification }) => {
  const isEditMode = !!orderToEdit;
  const [formData, setFormData] = useState(
    isEditMode ? {
      ...orderToEdit,
      items: orderToEdit.items || [{ type: '', qty: 1 }],
      deliveryOption: orderToEdit.deliveryOption || 'Doorstep',
    } : {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      customerName: '', // Auto-populated for Customer role
      status: 'Pending',
      deliveryOption: 'Doorstep',
      items: [{ type: '', qty: 1 }],
      totalPrice: 0,
      placedDate: new Date().toISOString(),
      partner: null,
      timeline: [{ status: 'Created', date: new Date().toISOString(), user: '', remark: 'Order initiated' }],
      auditLog: [],
    }
  );
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (currentUserRole === 'Customer' && !isEditMode) {
      setFormData(prev => ({ ...prev, customerName: USERS.customer.name, timeline: [{ status: 'Created', date: new Date().toISOString(), user: USERS.customer.name, remark: 'Order initiated' }] }));
    }
  }, [currentUserRole, isEditMode]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'customerName' && !value) error = 'Customer Name is required.';
    if (name === 'items') {
      if (!value || value.length === 0) error = 'At least one item is required.';
      else if (value.some(item => !item.type || item.qty <= 0)) error = 'Item type and quantity must be valid.';
    }
    if (name === 'pricePerItem' && (!value || value <= 0)) error = 'Price must be greater than zero.';
    if (name === 'itemType' && !value) error = 'Item type is required.';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'deliveryOption') {
        updated.timeline = prev.timeline ? [...prev.timeline, {
          status: 'Delivery Option Set',
          date: new Date().toISOString(),
          user: currentUser?.name || 'System',
          remark: `Delivery option changed to ${value}`,
        }] : [{ status: 'Delivery Option Set', date: new Date().toISOString(), user: currentUser?.name || 'System', remark: `Delivery option changed to ${value}` }];
      }
      return updated;
    });
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [name]: name === 'qty' ? parseInt(value) || 0 : value };
      return { ...prev, items: newItems };
    });
    setErrors(prev => ({ ...prev, items: validateField('items', formData.items) }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { type: '', qty: 1 }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    if (formData.items) {
      const itemsError = validateField('items', formData.items);
      if (itemsError) newErrors.items = itemsError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification({ id: Date.now(), title: 'Validation Error', message: 'Please correct the highlighted fields.', severity: 'error' });
      return;
    }

    // Simulate price calculation
    const calculatedPrice = (formData.items || []).reduce((acc, item) => {
      const rate = SAMPLE_RATES.find(r => r.itemType.toLowerCase() === item.type.toLowerCase());
      return acc + (item.qty * (rate?.pricePerItem || 10)); // Default to 10 if no rate found
    }, 0);
    const finalFormData = { ...formData, totalPrice: calculatedPrice };

    onSubmit(finalFormData);
    setIsSubmitted(true);
    addNotification({ id: Date.now(), title: isEditMode ? 'Order Updated' : 'Order Placed', message: `Order ${finalFormData.id} has been successfully ${isEditMode ? 'updated' : 'placed'}.`, severity: 'success' });
  };

  if (isSubmitted) {
    return (
      <div className="confirmation-screen">
        <i className="fas fa-check-circle confirmation-icon"></i>
        <div className="confirmation-message">{isEditMode ? 'Order Updated!' : 'Order Placed!'}</div>
        <div className="confirmation-subtext">Your order <strong>{formData.id}</strong> has been successfully {isEditMode ? 'updated' : 'submitted'}.</div>
        <div className="confirmation-next-steps">
          <button className="summary-action-button primary" onClick={() => navigate('ORDER_DETAIL', { orderId: formData.id })}>View Order</button>
          <button className="summary-action-button secondary" onClick={() => setIsSubmitted(false)}>Place Another Order</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>{isEditMode ? `Edit Order: ${orderToEdit?.id}` : 'Place New Ironing Order'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-accordion">
          <div className="accordion-panel">
            <div className="accordion-header" onClick={() => {}}>
              <span>Order Details</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="accordion-content">
              {currentUserRole !== 'Customer' && (
                <div className="form-group">
                  <label htmlFor="customerName">Customer Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName || ''}
                    onChange={handleChange}
                    className={errors.customerName ? 'error' : ''}
                  />
                  {errors.customerName && <p className="validation-error">{errors.customerName}</p>}
                </div>
              )}
              {currentUserRole === 'Admin' && (
                <div className="form-group">
                  <label htmlFor="partner">Assign Partner</label>
                  <select id="partner" name="partner" value={formData.partner || ''} onChange={handleChange}>
                    <option value="">Select Partner</option>
                    {SAMPLE_PARTNERS.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="accordion-panel">
            <div className="accordion-header" onClick={() => {}}>
              <span>Items to Iron</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="accordion-content">
              {(formData.items || []).map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                  <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                    <label htmlFor={`itemType-${index}`}>Item Type <span style={{ color: 'red' }}>*</span></label>
                    <select
                      id={`itemType-${index}`}
                      name="type"
                      value={item.type || ''}
                      onChange={(e) => handleItemChange(index, e)}
                      className={errors.items && (!item.type || item.qty <= 0) ? 'error' : ''}
                    >
                      <option value="">Select Type</option>
                      <option value="Shirt">Shirt</option>
                      <option value="Pants">Pants</option>
                      <option value="Dress">Dress</option>
                      <option value="Suit">Suit</option>
                      <option value="Towel">Towel</option>
                      <option value="Scarf">Scarf</option>
                      <option value="Curtain">Curtain</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label htmlFor={`itemQty-${index}`}>Qty <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="number"
                      id={`itemQty-${index}`}
                      name="qty"
                      value={item.qty || 1}
                      min="1"
                      onChange={(e) => handleItemChange(index, e)}
                      className={errors.items && (!item.type || item.qty <= 0) ? 'error' : ''}
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="icon-button" style={{ color: 'var(--status-rejected-border)', alignSelf: 'flex-end' }}>
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              ))}
              {errors.items && <p className="validation-error" style={{ gridColumn: '1 / -1' }}>{errors.items}</p>}
              <button type="button" onClick={addItem} className="summary-action-button secondary" style={{ gridColumn: '1 / -1', marginTop: 'var(--spacing-sm)' }}>
                <i className="fas fa-plus" style={{ marginRight: 'var(--spacing-xs)' }}></i> Add Item
              </button>
            </div>
          </div>

          <div className="accordion-panel">
            <div className="accordion-header" onClick={() => {}}>
              <span>Delivery Options</span>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="accordion-content">
              <div className="form-group">
                <label>Choose Delivery Method</label>
                <div>
                  <label style={{ marginRight: 'var(--spacing-md)' }}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="Doorstep"
                      checked={formData.deliveryOption === 'Doorstep'}
                      onChange={handleChange}
                      style={{ marginRight: 'var(--spacing-xs)' }}
                    />
                    Doorstep Delivery
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="Customer Pickup"
                      checked={formData.deliveryOption === 'Customer Pickup'}
                      onChange={handleChange}
                      style={{ marginRight: 'var(--spacing-xs)' }}
                    />
                    Customer Pickup
                  </label>
                </div>
              </div>
              {/* File upload example for delivery instructions or special notes */}
              <div className="form-group">
                <label htmlFor="specialInstructionsFile">Special Instructions/Notes (Optional)</label>
                <div className="file-upload-area">
                  <input type="file" id="specialInstructionsFile" style={{ display: 'none' }} />
                  <p className="file-upload-text"><i className="fas fa-upload" style={{ marginRight: 'var(--spacing-sm)' }}></i>Drag & Drop or Click to Upload</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="summary-action-button secondary" onClick={() => navigate('DASHBOARD')}>Cancel</button>
          <button type="submit" className="form-submit-button">{isEditMode ? 'Update Order' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  );
};

const PartnersView = ({ navigate }) => {
  // Admin-specific view
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Partners Management</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-md)' }}>
        <button className="summary-action-button primary" onClick={() => alert('Add New Partner Form would open')}>
          <i className="fas fa-plus" style={{ marginRight: 'var(--spacing-xs)' }}></i> Add Partner
        </button>
      </div>
      <div className="card-grid">
        {SAMPLE_PARTNERS.map(partner => (
          <div key={partner.id} className="card" onClick={() => alert(`View Partner ${partner.name} details`)}>
            <div className="order-card-header">
              <span className="order-id">{partner.name}</span>
              <span className="status-tag" style={getStatusStyles(partner.status)}>{partner.status}</span>
            </div>
            <div className="order-details-row">
              <span>Contact:</span>
              <span>{partner.contact}</span>
            </div>
            <div className="order-details-row">
              <span>Orders Completed:</span>
              <span>{partner.ordersCompleted}</span>
            </div>
            <div className="order-details-row">
              <span>Avg. Rating:</span>
              <span>{partner.avgRating} <i className="fas fa-star" style={{ color: 'gold' }}></i></span>
            </div>
            <div className="order-card-actions">
              <button className="order-card-action-button" onClick={(e) => { e.stopPropagation(); alert(`Edit ${partner.name}`); }}>Edit</button>
              <button className="order-card-action-button" style={{ backgroundColor: 'var(--status-rejected-border)' }} onClick={(e) => { e.stopPropagation(); alert(`Deactivate ${partner.name}`); }}>Deactivate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RatesView = ({ navigate, addNotification }) => {
  const [rates, setRates] = useState(SAMPLE_RATES);
  const [editingRateId, setEditingRateId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (rate) => {
    setEditingRateId(rate.id);
    setEditFormData({ ...rate });
    setEditErrors({});
  };

  const saveEdit = (id) => {
    const error = validateField('pricePerItem', editFormData.pricePerItem);
    if (error) {
      setEditErrors({ pricePerItem: error });
      addNotification({ id: Date.now(), title: 'Validation Error', message: 'Price per item must be a valid number greater than zero.', severity: 'error' });
      return;
    }

    setRates(prevRates => prevRates.map(rate =>
      rate.id === id ? { ...editFormData, lastUpdated: new Date().toISOString().split('T')[0] } : rate
    ));
    setEditingRateId(null);
    addNotification({ id: Date.now(), title: 'Rate Updated', message: `Rate for ${editFormData.itemType} updated successfully.`, severity: 'success' });
  };

  const cancelEdit = () => {
    setEditingRateId(null);
    setEditFormData({});
    setEditErrors({});
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'pricePerItem') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) error = 'Price must be a number greater than zero.';
    }
    return error;
  };

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Pricing Rates Management</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-md)' }}>
        <button className="summary-action-button primary" onClick={() => alert('Add New Rate Form would open')}>
          <i className="fas fa-plus" style={{ marginRight: 'var(--spacing-xs)' }}></i> Add Rate
        </button>
      </div>
      <div className="card-grid">
        {rates.map(rate => (
          <div key={rate.id} className="card">
            {editingRateId === rate.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Item Type:</label>
                  <input type="text" value={editFormData.itemType} readOnly style={{ backgroundColor: 'var(--color-light-gray)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="pricePerItem">Price Per Item: <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    id="pricePerItem"
                    name="pricePerItem"
                    value={editFormData.pricePerItem}
                    onChange={handleEditChange}
                    className={editErrors.pricePerItem ? 'error' : ''}
                  />
                  {editErrors.pricePerItem && <p className="validation-error">{editErrors.pricePerItem}</p>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                  <button className="summary-action-button secondary" onClick={cancelEdit}>Cancel</button>
                  <button className="summary-action-button primary" onClick={() => saveEdit(rate.id)}>Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="order-card-header">
                  <span className="order-id">{rate.itemType}</span>
                  <span className="status-tag" style={getStatusStyles('approved')}>Active</span>
                </div>
                <div className="order-details-row">
                  <span>Price:</span>
                  <span>{formatCurrency(rate.pricePerItem)}</span>
                </div>
                <div className="order-details-row">
                  <span>Last Updated:</span>
                  <span>{rate.lastUpdated}</span>
                </div>
                <div className="order-card-actions">
                  <button className="order-card-action-button" onClick={() => startEdit(rate)}>Edit</button>
                  <button className="order-card-action-button" style={{ backgroundColor: 'var(--status-rejected-border)' }} onClick={() => alert(`Remove ${rate.itemType}`)}>Remove</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsView = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Analytics Dashboard (Admin)</h2>
      <div className="card-grid">
        <ChartContainer title="Monthly Revenue">
          <img src="https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Revenue',data:[12000,15000,13000,17000,19000,22000],fill:false,borderColor:'rgb(217, 58, 169)'}]}}" alt="Monthly Revenue Chart" style={{maxWidth: '100%', height: 'auto'}} />
        </ChartContainer>
        <ChartContainer title="Orders by Delivery Type">
          <img src="https://quickchart.io/chart?c={type:'doughnut',data:{labels:['Doorstep','Pickup'],datasets:[{data:[60,40],backgroundColor:['#047857','#17A2B8']}]}}" alt="Delivery Type Chart" style={{maxWidth: '100%', height: 'auto'}} />
        </ChartContainer>
        <ChartContainer title="Partner Performance">
          <img src="https://quickchart.io/chart?c={type:'bar',data:{labels:['Partner A','Partner B','Partner C'],datasets:[{label:'Orders Completed',data:[150,80,200],backgroundColor:'rgb(217, 58, 169)'}]}}" alt="Partner Performance Chart" style={{maxWidth: '100%', height: 'auto'}} />
        </ChartContainer>
        <ChartContainer title="Average Turnaround Time">
          <img src="https://quickchart.io/chart?c={type:'gauge',data:{datasets:[{value:20,minValue:0,maxValue:48,backgroundColor:'rgb(217, 58, 169)',borderWidth:0}],labels:['Avg TAT (hours)']}}" alt="TAT Gauge Chart" style={{maxWidth: '100%', height: 'auto'}} />
        </ChartContainer>
      </div>
      <div style={{marginTop: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end'}}>
        <button className="summary-action-button secondary" onClick={() => alert('Export to PDF')}>
          <i className="fas fa-file-pdf" style={{marginRight: 'var(--spacing-xs)'}}></i> Export PDF
        </button>
        <button className="summary-action-button secondary" onClick={() => alert('Export to Excel')}>
          <i className="fas fa-file-excel" style={{marginRight: 'var(--spacing-xs)'}}></i> Export Excel
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentUserRole, setCurrentUserRole] = useState('Admin'); // Default role
  const currentUser = USERS[currentUserRole.replace(/\s+/g, '').toLowerCase()] || USERS.admin;

  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false); // For simulating loading bar
  const [orders, setOrders] = useState(SAMPLE_ORDERS);

  const addNotification = useCallback((newNotification) => {
    setNotifications(prev => [...prev, { ...newNotification, id: newNotification.id || Date.now() }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const navigate = useCallback((screen, params = {}) => {
    if (!ROLES[currentUserRole]?.includes(screen)) {
      addNotification({ id: Date.now(), title: 'Access Denied', message: `You do not have permission to access ${screen}.`, severity: 'error' });
      return;
    }
    setLoading(true); // Start loading bar
    setTimeout(() => {
      setView({ screen, params });
      setLoading(false); // End loading bar
    }, 300); // Simulate network delay
  }, [currentUserRole, addNotification]);

  const handleSearchSelect = useCallback((type, params) => {
    setIsSearchOpen(false);
    if (type === 'ORDER') {
      navigate('ORDER_DETAIL', { orderId: params.orderId });
    }
    // Add logic for other types like PARTNER, RATE
  }, [navigate]);

  const updateOrderStatus = useCallback((updatedOrderOrOrders) => {
    setOrders(prevOrders => {
      if (Array.isArray(updatedOrderOrOrders)) {
        return updatedOrderOrOrders;
      } else {
        return prevOrders.map(order => order.id === updatedOrderOrOrders.id ? updatedOrderOrOrders : order);
      }
    });
  }, []);

  const handleOrderFormSubmit = useCallback((newOrderData) => {
    setOrders(prevOrders => {
      const existingIndex = prevOrders.findIndex(o => o.id === newOrderData.id);
      if (existingIndex !== -1) {
        // Update existing order
        return prevOrders.map(order => order.id === newOrderData.id ? { ...order, ...newOrderData } : order);
      } else {
        // Add new order
        return [...prevOrders, {
          ...newOrderData,
          timeline: [...(newOrderData.timeline || []), { status: newOrderData.status, date: new Date().toISOString(), user: currentUser?.name, remark: 'Order placed' }],
          auditLog: [...(newOrderData.auditLog || []), { timestamp: new Date().toISOString(), user: currentUser?.name, action: 'Order Created', details: 'New order placed' }]
        }];
      }
    });
    navigate('ORDER_DETAIL', { orderId: newOrderData.id });
  }, [navigate, currentUser?.name]);

  const getScreenTitle = (screen) => {
    switch (screen) {
      case 'DASHBOARD': return 'Dashboard';
      case 'ORDERS': return 'Orders Management';
      case 'ORDER_DETAIL': return `Order ${view.params.orderId || 'Details'}`;
      case 'ORDER_FORM_CUSTOMER': return 'Place New Order';
      case 'ORDER_FORM_SP': return 'Update Order Status';
      case 'ORDER_FORM_ADMIN': return `Edit Order ${view.params.orderId}`;
      case 'PARTNERS': return 'Partner Management';
      case 'RATES': return 'Pricing Rates';
      case 'ANALYTICS': return 'Business Analytics';
      default: return 'IronEclipse';
    }
  };

  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <Dashboard currentUserRole={currentUserRole} navigate={navigate} notifications={notifications} addNotification={addNotification} />;
      case 'ORDERS':
        return <OrdersView currentUserRole={currentUserRole} navigate={navigate} orders={orders} updateOrderStatus={updateOrderStatus} currentUser={currentUser} />;
      case 'ORDER_DETAIL':
        const order = orders.find(o => o.id === view.params.orderId);
        return <OrderDetail order={order} navigate={navigate} updateOrderStatus={updateOrderStatus} currentUserRole={currentUserRole} currentUser={currentUser} />;
      case 'ORDER_FORM_CUSTOMER':
      case 'ORDER_FORM_SP':
      case 'ORDER_FORM_ADMIN':
        const orderToEdit = view.params.orderId ? orders.find(o => o.id === view.params.orderId) : null;
        return <OrderForm navigate={navigate} currentUserRole={currentUserRole} onSubmit={handleOrderFormSubmit} orderToEdit={orderToEdit} addNotification={addNotification} />;
      case 'PARTNERS':
        return <PartnersView navigate={navigate} />;
      case 'RATES':
        return <RatesView navigate={navigate} addNotification={addNotification} />;
      case 'ANALYTICS':
        return <AnalyticsView />;
      default:
        return <h2 style={{ padding: 'var(--spacing-xl)' }}>Welcome to IronEclipse! Select a view from the navigation.</h2>;
    }
  };

  return (
    <div className="app-wrapper">
      <div className={`loading-bar ${loading ? 'active' : ''} ${!loading && view.screen ? 'complete' : ''}`}></div>
      <div className="app-container">
        <NavBar currentUserRole={currentUserRole} navigate={navigate} currentScreen={view.screen} />
        <div className="main-content">
          <Header
            currentUser={currentUser}
            onSearchClick={() => setIsSearchOpen(true)}
            onNotificationsClick={() => alert('Notifications panel would open (not implemented)')}
            title={getScreenTitle(view.screen)}
          />
          {renderScreen()}
        </div>
      </div>

      <GlobalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelectResult={handleSearchSelect} />

      <div className="notification-container">
        {notifications.map(n => (
          <NotificationToast key={n.id} notification={n} onClose={removeNotification} />
        ))}
      </div>

      {/* Role Switcher for Demo Purposes */}
      <div style={{ position: 'fixed', bottom: 'var(--spacing-md)', left: 'var(--spacing-md)', zIndex: 1001, backgroundColor: 'var(--color-card-bg)', padding: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-elevation-2)' }}>
        <label htmlFor="role-switcher" style={{ marginRight: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-subtle-text)' }}>Switch Role:</label>
        <select
          id="role-switcher"
          value={currentUserRole}
          onChange={(e) => {
            setCurrentUserRole(e.target.value);
            setView({ screen: 'DASHBOARD', params: {} }); // Reset view on role change
            addNotification({ id: Date.now(), title: 'Role Changed', message: `Switched to ${e.target.value} role.`, severity: 'info' });
          }}
          style={{ padding: 'var(--spacing-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border-light)' }}
        >
          {Object.keys(ROLES).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default App;