// Copyright (c) 2023, Rasiin Tech and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["User Sales"] = {
    "filters": [
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "width": "80"
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today()
        },
        {
            "fieldname": "customer",
            "label": __("Customer"),
            "fieldtype": "Link",
            "options": "Customer"
        },
        {
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "default": frappe.defaults.get_user_default("Company")
        },
        {
            "fieldname": "mode_of_payment",
            "label": __("Mode of Payment"),
            "fieldtype": "Link",
            "options": "Mode of Payment"
        },
        {
            "fieldname": "owner",
            "label": __("Owner"),
            "fieldtype": "Link",
            "options": "User",
            "hidden": 0
        },
        {
            "fieldname": "cost_center",
            "label": __("Cost Center"),
            "fieldtype": "Link",
            "options": "Cost Center"
        },
        {
            "fieldname": "warehouse",
            "label": __("Warehouse"),
            "fieldtype": "Link",
            "options": "Warehouse"
        },
        {
            "fieldname": "brand",
            "label": __("Brand"),
            "fieldtype": "Link",
            "options": "Brand"
        },
        {
            "fieldname": "item_group",
            "label": __("Item Group"),
            "fieldtype": "Link",
            "options": "Item Group"
        }
    ],

    onload: function(report) {
        cleanup_user_sales_dom(report);  // Remove any unwanted OPD section when the report is loaded
        // Add any other onload logic here
        erpnext.utils.add_dimensions('Sales Register', 7);
    },

    refresh: function(report) {
        cleanup_user_sales_dom(report);  // Cleanup before refreshing
        // Additional refresh logic can be added here
    },

    after_datatable_render: function(report) {
        // You can add further logic after data rendering if needed
    }
};

// Cleanup function to remove OPD-specific sections
function cleanup_user_sales_dom(report) {
    const wrapper = get_safe_wrapper(report);
    if (!wrapper) return;

   // Remove any section specific to OPD or previous report
    wrapper.querySelector("#doctor-sales-extra-pie-section")?.remove();
    wrapper.querySelector("#opd-extra-pie-section")?.remove();  // Prevent lingering OPD section
    wrapper.querySelector("#ipd-extra-chart-section")?.remove();
    // Remove any other sections that should not be carried over
}

// Helper function to get the wrapper for report DOM
function get_safe_wrapper(report) {
    if (report && report.page && report.page.wrapper && report.page.wrapper[0]) {
        return report.page.wrapper[0];
    }
    return null;
}