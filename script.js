function megabillApp() {
  return {
    currentView: "dashboard",
    mobileMenuOpen: false,
    config: {
      company_name: "Acme Corporation",
      total_balance: "$247,832.50",
      monthly_income: "$84,250.00",
      monthly_expenses: "$52,417.50",
    },
    navItems: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>',
      },
      {
        id: "transactions",
        label: "Transactions",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      },
      {
        id: "audit",
        label: "Audit View",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M10 3l4 4M10 3L6 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="1.5"/></svg>',
      },
      {
        id: "reports",
        label: "Reports",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16V8M8 16V4M12 16V10M16 16V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      },
      {
        id: "settings",
        label: "Settings",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9L4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
      },
    ],
    transactions: [],
    auditLog: [
      {
        type: "transaction",
        title: "Transaction Created",
        timestamp: "January 15, 2025 • 14:32:18 UTC",
        status: "VERIFIED",
        txnId: "TXN-2025-0115-0432",
        amount: 25000,
        amountFormatted: "+$25,000.00",
        category: "Revenue",
      },
      {
        type: "log",
        title: "Audit Log Entry",
        timestamp: "January 15, 2025 • 14:32:19 UTC",
        status: "LOCKED",
        hash: "0x4a7b9c3d2e1f8a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b",
      },
      {
        type: "transaction",
        title: "Transaction Created",
        timestamp: "January 14, 2025 • 09:15:42 UTC",
        status: "VERIFIED",
        txnId: "TXN-2025-0114-0915",
        amount: -342.18,
        amountFormatted: "-$342.18",
        category: "Operations",
      },
      {
        type: "log",
        title: "Audit Log Entry",
        timestamp: "January 14, 2025 • 09:15:43 UTC",
        status: "LOCKED",
        hash: "0x7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
      },
      {
        type: "transaction",
        title: "Transaction Created",
        timestamp: "January 13, 2025 • 16:48:29 UTC",
        status: "VERIFIED",
        txnId: "TXN-2025-0113-1648",
        amount: -599.99,
        amountFormatted: "-$599.99",
        category: "Software",
      },
    ],
    init() {
      this.fetchTransactions();
    },
    async fetchTransactions() {
      try {
        // 1. Fetch the data. Assume the endpoint is '/transactions'
        const response = await apiFetch("/transactions");

        // The API response is { data: [ { transaction }, ... ] }
        const rawTransactions = response.data;

        // 2. Use .map() to transform the keys of the fetched data
        this.transactions = rawTransactions.map((txn) => ({
          // Map to the expected keys:
          id: txn.id,
          date: txn.date_readable, // Renames 'date_readable' to 'date'
          description: txn.description,
          category: txn.category,
          amount: txn.amount,
          amountFormatted: txn.amount_formatted, // Renames 'amount_formatted' to 'amountFormatted'
          // We can also include the new fields if needed:
          type: txn.type,
          status: txn.status,
        }));
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    },
  };
}
const API_BASE = "http://127.0.0.1/client/key";

async function apiFetch(endpoint, options = {}) {
  const token = 1; //getAuthToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });

  if (!res.ok) throw new Error("API error");

  return res.json();
}

function transactionForm() {
  return {
    loading: false,
    success: false,
    error: null,

    form: {
      date: new Date().toISOString().slice(0, 10),
      description: "",
      category: "",
      amount: null,
    },

    async submit() {
      this.loading = true;
      this.error = null;
      this.success = false;

      try {
        const res = await apiFetch("/transactions", {
          method: "POST",
          body: JSON.stringify(this.form),
        });

        // Update global transaction list if available
        if (window.megabillStore) {
          window.megabillStore.transactions.unshift({
            ...this.form,
            id: res.data.id,
            amountFormatted: res.data.amount_formatted,
            status: res.data.status,
          });
        }

        this.success = true;

        // Reset form except date
        this.form.description = "";
        this.form.category = "";
        this.form.amount = null;
      } catch (e) {
        this.error = "Failed to create transaction.";
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  };
}
const defaultConfig = {
  company_name: "Acme Corporation",
  total_balance: "$247,832.50",
  monthly_income: "$84,250.00",
  monthly_expenses: "$52,417.50",
  background_color: "#0f172a",
  surface_color: "#1e293b",
  text_color: "#f8fafc",
  primary_action_color: "#3b82f6",
  secondary_action_color: "#10b981",
  font_family: "Inter",
  font_size: 16,
};

async function onConfigChange(config) {
  const app = Alpine.$data(document.querySelector("[x-data]"));
  if (app) {
    app.config.company_name = config.company_name || defaultConfig.company_name;
    app.config.total_balance =
      config.total_balance || defaultConfig.total_balance;
    app.config.monthly_income =
      config.monthly_income || defaultConfig.monthly_income;
    app.config.monthly_expenses =
      config.monthly_expenses || defaultConfig.monthly_expenses;
  }

  const backgroundColor =
    config.background_color || defaultConfig.background_color;
  const surfaceColor = config.surface_color || defaultConfig.surface_color;
  const textColor = config.text_color || defaultConfig.text_color;
  const primaryActionColor =
    config.primary_action_color || defaultConfig.primary_action_color;
  const customFont = config.font_family || defaultConfig.font_family;
  const baseSize = config.font_size || defaultConfig.font_size;

  document.querySelector(".app-wrapper").style.background = backgroundColor;
  document.querySelectorAll(".card").forEach((card) => {
    card.style.background = surfaceColor;
  });
  document.querySelectorAll("h1, h2, h3").forEach((heading) => {
    heading.style.color = textColor;
  });

  const baseFontStack = "Arial, sans-serif";
  document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;
  document.body.style.fontSize = `${baseSize}px`;
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      {
        get: () => config.background_color || defaultConfig.background_color,
        set: (value) => {
          config.background_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ background_color: value });
          }
        },
      },
      {
        get: () => config.surface_color || defaultConfig.surface_color,
        set: (value) => {
          config.surface_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ surface_color: value });
          }
        },
      },
      {
        get: () => config.text_color || defaultConfig.text_color,
        set: (value) => {
          config.text_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ text_color: value });
          }
        },
      },
      {
        get: () =>
          config.primary_action_color || defaultConfig.primary_action_color,
        set: (value) => {
          config.primary_action_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ primary_action_color: value });
          }
        },
      },
      {
        get: () =>
          config.secondary_action_color || defaultConfig.secondary_action_color,
        set: (value) => {
          config.secondary_action_color = value;
          if (window.elementSdk) {
            window.elementSdk.setConfig({ secondary_action_color: value });
          }
        },
      },
    ],
    borderables: [],
    fontEditable: {
      get: () => config.font_family || defaultConfig.font_family,
      set: (value) => {
        config.font_family = value;
        if (window.elementSdk) {
          window.elementSdk.setConfig({ font_family: value });
        }
      },
    },
    fontSizeable: {
      get: () => config.font_size || defaultConfig.font_size,
      set: (value) => {
        config.font_size = value;
        if (window.elementSdk) {
          window.elementSdk.setConfig({ font_size: value });
        }
      },
    },
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ["company_name", config.company_name || defaultConfig.company_name],
    ["total_balance", config.total_balance || defaultConfig.total_balance],
    ["monthly_income", config.monthly_income || defaultConfig.monthly_income],
    [
      "monthly_expenses",
      config.monthly_expenses || defaultConfig.monthly_expenses,
    ],
  ]);
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities,
    mapToEditPanelValues,
  });
}
