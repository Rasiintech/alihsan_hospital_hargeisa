frappe.query_reports["Doctor Sales"] = {
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
            "hidden": 1
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
        },
    ],

    "onload": function(report) {
        cleanup_doctor_sales_dom(report);  // Cleanup DOM when report is loaded

        // Any additional setup for the report
        const btn = report.get_filter("refresh_data");
        if (btn && btn.$input) {
            btn.$input.off("click").on("click", function() {
                cleanup_doctor_sales_dom(report); // Cleanup when refresh button is clicked
                report.refresh();
            });
        }
    },

    "refresh": function(report) {
        cleanup_doctor_sales_dom(report);  // Cleanup before refreshing the report
        // Perform the actual refresh
        // Add any additional steps needed for refresh
    },

    "after_datatable_render": function(report) {
        if (!is_correct_report(report, "Doctor Sales")) return;
        // Additional actions after data is rendered, like charts or other UI enhancements
    }
};

// Cleanup function for Doctor Sales report to remove unwanted sections
function cleanup_doctor_sales_dom(report) {
    const wrapper = get_safe_wrapper(report);
    if (!wrapper) return;

    // Remove any section specific to OPD or previous report
    wrapper.querySelector("#doctor-sales-extra-pie-section")?.remove();
    wrapper.querySelector("#opd-extra-pie-section")?.remove();  // Prevent lingering OPD section
    wrapper.querySelector("#ipd-extra-chart-section")?.remove();
    // Remove any other sections that should not be carried over
}

// Ensuring the correct report is loaded
function is_correct_report(report, report_name) {
    return report && report.report_name === report_name;
}

// Function to get the wrapper element of the report
function get_safe_wrapper(report) {
    if (report && report.page && report.page.wrapper && report.page.wrapper[0]) {
        return report.page.wrapper[0];
    }
    return null;
}