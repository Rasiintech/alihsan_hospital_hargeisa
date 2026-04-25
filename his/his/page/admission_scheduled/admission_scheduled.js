frappe.pages['admission-scheduled'].on_page_load = function(wrapper) {
	new IPD(wrapper)
}

IPD = Class.extend(
	{
		init:function(wrapper){
			this.page = frappe.ui.make_app_page({
				parent : wrapper,
				title: "Admission Scheduled",
				single_column : true
			});
			this.groupbyD = []
			this.currDate =  frappe.datetime.get_today()
			this.make()
			this.setupdata_table()
			this.make_grouping_btn()
			let myf_ads = this
			frappe.realtime.on('inp_update', (data) => {
				// alert("in realtime")
				myf_ads.setupdata_table()
					})
		},
		make:function(){
			let me_s = this
			$(frappe.render_template(frappe.dashbard_page.body, me_s)).appendTo(me_s.page.main)
		},
		make_grouping_btn:function(){
		let listitmes_ad_sc = ''
			
				$(`<div class="mt-2 sort-selector">
				
	
	
	
				<button type="button" class="btn btn-primary" onclick="add_inpatient()">Add New<b class="caret"></b></a>
				</button>
				<ul class="dropdown-menu">
				${listitmes_ad_sc}
			</ul>
				</div>`).appendTo('.page-head')
			
			// this.group_by_control = new frappe.ui.GroupBy(this);
		
		},


		setupdata_table : function(gr_ref){
			
		let tbldata = []
		frappe.db.get_list('Inpatient Record', {
			fields: ['name','patient','patient_name', 'room' , 'type' , 'status' ,'scheduled_date' , 'admission_practitioner', 'diagnose', "sales_invoice"],
			filters: {
				status: 'Admission Scheduled'
			},
			limit : 1000
		}).then(r => {
			
			tbldata = r
		 	columns = [
			// {title:"SN", field:"name"},
			{title:"PID", field:"patient" ,  headerFilter:"input"},
			{title:"Patient Name", field:"patient_name" ,  headerFilter:"input"},
			{title:"Date", field:"scheduled_date" ,  headerFilter:"input"},
			{title:"Doctor Name", field:"admission_practitioner" ,  headerFilter:"input",},
			{title:"Type", field:"type" ,  headerFilter:"input",},
			{title:"Status", field:"status" ,  headerFilter:"input",},
			{title:"Diagnosis", field:"diagnose" ,  headerFilter:"input",},
			{title:"Action", field:"action", hozAlign:"center" , formatter:"html"},
			
		 ]
		let new_data_ad_s = []
		tbldata.forEach(row => {
			let btnhml = ''
			if(!row.sales_invoice){
				btnhml += `
				<button class='btn btn-warning ml-2' style='color:white' onclick = "make_payment('${row.name}','${row.patient }', '${row.admission_practitioner}' )"> Make Payment</button>
				`
			}

			if (row.sales_invoice) {
				frappe.db.get_value("Sales Invoice", row.sales_invoice, "docstatus")
					.then(r => {
						// console.log(r.message.docstatus)
						if (r.message && r.message.docstatus != 1) {
							btnhml += `
							<button class='btn btn-warning ml-2' style='color:white' onclick = "make_payment('${row.name}','${row.patient }', '${row.admission_practitioner}' )"> Make Payment</button>
							`
						}
					});
			}
			
			btnhml += `
			<button class='btn btn-primary ml-2' onclick = "admit('${row.name}','${row.patient }', '${row.admission_practitioner }')"> Admit</button>
			<button class='btn btn-danger ml-2' onclick = "cancel_admision('${row.name}','${row.patient }')"> Cancel</button>
		
			
			`
			row['action'] = btnhml
			new_data_ad_s.push(row)
		})
		// console.log(columns)
this.table = new Tabulator("#ad_sche", {
			layout:"fitDataFill",
			rowHeight:30, 
			//  selectable:true,
			//  dataTree:true,
			//  dataTreeStartExpanded:true,
			 groupStartOpen:false,
			 printAsHtml:true,
			//  printHeader:`<img src = '/private/files/WhatsApp Image 2022-10-20 at 6.19.02 PM.jpeg'>`,
			 printFooter:"<h2>Example Table Footer<h2>",
			 // groupBy:"customer",
			 groupHeader:function(value, count, data, group){
				 //value - the value all members of this group share
				 //count - the number of rows in this group
				 //data - an array of all the row data objects in this group
				 //group - the group component for the group
			 // console.log(group)
				 return value + "<span style=' margin-left:0px;'>(" + count + "   )</span>";
			 },
			 groupToggleElement:"header",
			//  groupBy:groupbyD.length >0 ? groupbyD : "",
			 textDirection: frappe.utils.is_rtl() ? "rtl" : "ltr",
	 
			 columns: columns,			 
			 data: new_data_ad_s
		 });
	});
		},

	},
	

	
)
let ScheduleAd = `

<div class="container">
<div class="row">

<div id="ad_sche" style = "min-width : 100%"></div>

</div>


<!-- endrow 2--- >
</div>


`
frappe.dashbard_page = {
	body : ScheduleAd
}

formatter = function(cell, formatterParams, onRendered){
			return frappe.datetime.prettyDate(cell.getValue() , 1)
		}

function cancel_admision(inpatient_record, patient){
	frappe.confirm('Are you sure you want to Cancelled?',
    () => {
        // action to perform if Yes is selected
		frappe.call({
			
			method: 'his.api.admission_schd.cancel_admision',
			args:{
				
				"inp_doc" :inpatient_record,
			},
			callback: function(data) {
				frappe.msgprint("Cancelled Succesfullyss")
				location.reload();

			}
		})
    }, () => {
        // action to perform if No is selected
    })


}

function admit(inpatient_record, patient, practitioner, type){
	// alert(patient)

	let d = new frappe.ui.Dialog({
		title: 'Enter details',
		fields: [
			{fieldtype: 'Link', label: 'Type', fieldname: 'type', options: 'Inpatient Type',reqd: 1 , default: type},
			{fieldtype: 'Link', label: 'Room', fieldname: 'room', options: 'Healthcare Service Unit Type',reqd: 1},
			{fieldtype: 'Link', label: 'Bed', fieldname: 'bed', options: 'Healthcare Service Unit', reqd: 1},
			{fieldtype: 'Link', label: 'Additional Bed', fieldname: 'bed2', options: 'Healthcare Service Unit', reqd: 0, "hidden": 1},
			{fieldtype: 'Datetime', label: 'Check In', fieldname: 'check_in', reqd: 1, default: frappe.datetime.now_datetime()}
			   
	
		],
		primary_action_label: 'Submit',
		primary_action(values) {
			admit_p(inpatient_record ,values.bed , patient, practitioner, values.type )
			// alert("ok")
				// console.log(values.room)
			//    frappe.route_options = {'room': values.room , "type" : values.type  , "inp_doc" : inpatient_record  , "patient" : patient };
			// 	frappe.set_route('room');
			d.hide();
		}
	});
		d.fields_dict['room'].get_query = function(){
		return {
			filters: {
				'inpatient_occupancy': 1,
				'Type':"IPD"
			}
		};
	};

	d.fields_dict['bed'].get_query = function(){
		return {
			filters: {
				'inpatient_occupancy': 1,
				'service_unit_type':d.get_value('room'),
				"occupancy_status": "Vacant"
			}
		};
	};
	
	d.show();
}

function admit_p(inpatient_record, bed,patient_name, practitioner, type){
	frappe.call({
			
		method: 'his.api.admit.admit_p',
		args:{
			
			"inp_doc" :inpatient_record,
			'service_unit': bed,
			"patient":patient_name,
			"practitioner":practitioner,
			'type' : type
			
			// "is_insurance" : data.ref_insturance
			// 'check_in': Date(),
			// 'expected_discharge': expected_discharge
		},
		callback: function(data) {
			frappe.msgprint("Admited")
			window.location.reload();

		}
	})

}

	
		


function add_inpatient(){
	let d = new frappe.ui.Dialog({
		title: 'Enter details',
		fields: [
			{
				label: 'Patient',
				fieldname: 'patient',
				fieldtype: 'Link',
				options: 'Patient',
				change: function () {
                    frappe.call({
						method: 'frappe.client.get',
						args: {
							doctype: 'Patient',
							name: d.get_value("patient")
						},
						callback: function (data) {
							if (data && data.message) {
								// Set the fetched patient name in the dialog
								d.set_value('patient_name', data.message.patient_name);
							}
						}
					});
                },
				reqd : 1,
				
			},
			{
				label: 'Patient Name',
				fieldname: 'patient_name',
				fieldtype: 'Data',
				reqd : 0,
				fetch_from : "patient.first_name",
				
			},

			// {
			// 	label: 'Patient Name',
			// 	fieldname: 'diagnosis',
			// 	fieldtype: 'Data',
			// 	fetch_from : "patient.full_name",
			// 	read_only : 1
				
			// },
			{
				label: 'Practitioner',
				fieldname: 'practitioner',
				fieldtype: 'Link',
				options: 'Healthcare Practitioner',
				reqd : 1,
				
			},
			{
				label: 'Diagnosis',
				fieldname: 'diagnosis',
				fieldtype: 'Data',
				
				reqd : 0,
				
			},
		
		 
		],
		primary_action_label: 'Submit',
		primary_action(values) {
			//   let practitioner = d.get_value("practitioner")
			//   let patient = d.get_value("patient")
			 
			  var args = {
				patient: patient = d.get_value("patient"),
				primary_practitioner :  d.get_value("practitioner"),
                diagnosis : d.get_value('diagnosis'),
				// admission_encounter: ""
                
				
			}
		
				frappe.call({
						method: "his.api.admission_schd.schedule_inpatient", //dotted path to server method
						args: {
							args: args
						},
						callback: function(r) {
							// code snippet
							// console.log(r)
						window.location.reload();
						 frappe.utils.play_sound("submit")
	
							frappe.show_alert({
						message:__('You have Refered Patient Succesfully'),
						indicator:'green',
						
					}, 5);
					
						}
	});
			d.hide();
	
		
		}
		
	});
	
	d.show();
				 
} 


function make_payment(inpatient_record, patient, practitioner){
	
    	let d = new frappe.ui.Dialog({
		title: 'Enter details',
		fields: [
			{
	fieldtype: 'Link',
	label: 'Room',
	fieldname: 'room',
	options: 'Healthcare Service Unit Type',
	reqd: 1,
	change: function () {
		let room = d.get_value('room');

				if (room) {
					frappe.db.get_value(
						'Healthcare Service Unit Type',
						room,
						['item', 'rate']
					).then(r => {
						if (r.message) {
							d.set_value('item_code', r.message.item || '');
							d.set_value('rate', r.message.rate || 0);
						}
					});
				}
			}
		},
			{fieldtype: 'Link', label: 'Item', fieldname: 'item_code', options: 'Item',  fetch_from : "room.item",  read_only: 1},
			{fieldtype: 'Link', label: 'Rate', fieldname: 'rate', fetch_from : "room.rate",  read_only: 1},
			{fieldtype: 'Link', label: 'Bed', fieldname: 'bed', options: 'Healthcare Service Unit', reqd: 1},
			{fieldtype: 'Link', label: 'Additional Bed', fieldname: 'bed2', options: 'Healthcare Service Unit', reqd: 0, "hidden": 1},
			// {fieldtype: 'Datetime', label: 'Check In', fieldname: 'check_in', reqd: 1, default: frappe.datetime.now_datetime()}
			   
	
		],
		primary_action_label: 'Make Invoice',
		primary_action(values) {
			let company = frappe.defaults.get_default("company");

			frappe.db.get_doc("Item", values.item_code).then(item => {
				let income_account = "";

				// 1. Check Item Default Income Account
				if (item.item_defaults && item.item_defaults.length) {
					let item_default = item.item_defaults.find(d => d.company === company);
					if (item_default && item_default.income_account) {
						income_account = item_default.income_account;
					}
				}

				// 2. If not found, get Company Default Income Account
				let income_account_promise = income_account
					? Promise.resolve(income_account)
					: frappe.db.get_value("Company", company, "default_income_account")
						.then(r => r.message.default_income_account || "");

				income_account_promise.then(final_income_account => {
					frappe.new_doc("Sales Invoice", {
						patient: patient,
						ref_practitioner: practitioner,
						inpatient_admit: inpatient_record,
						company: company
					}, function(doc) {
						doc.items = [];

						let row = frappe.model.add_child(doc, "items");
						row.item_code = values.item_code;
						row.item_name = values.item_code;
						row.uom = "Nos";
						row.description = values.bed;
						row.qty = 1;
						row.rate = values.rate || 0;
						row.income_account = final_income_account;
					});
				});
			});

			d.hide();
		}
	});
		d.fields_dict['room'].get_query = function(){
		return {
			filters: {
				'inpatient_occupancy': 1,
				'Type':"IPD"
			}
		};
	};

	d.fields_dict['bed'].get_query = function(){
		return {
			filters: {
				'inpatient_occupancy': 1,
				'service_unit_type':d.get_value('room'),
				"occupancy_status": "Vacant"
			}
		};
	};
	
	d.show();


}