sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "zfiempreport/controller/BaseController",
    "sap/m/MessageBox"
], (Controller,BaseController,MessageBox) => {
    "use strict";

    return BaseController.extend("zfiempreport.controller.Main", {
        onInit() {
            var sval = {
                "PernrFrom": '',
                "PernrTo":'',
                "PernrRange":'',
                "Pernr":'',
                'ExpenseFrom':'',
                'ExpenseTo':'',
                'ClaimnoFrom':'',
                'ClaimnoTo':'',
                'DateFrom':null,
                'DateTo':null,
                'Status':''

            }
            this.getOwnerComponent().getModel("LocalModel").setProperty("/results",sval);
            this.getOdata("/CRSTATSet","Status",null);
            var sval={
                "Value":''
            }
            var oval=[];
            oval.push(sval);
            this.getOwnerComponent().getModel("onpressPernr").setProperty("/results",oval);
            this.getOwnerComponent().getModel("onpressClaimno").setProperty("/results", oval);
            this.getOwnerComponent().getModel("onpressExpenseTo").setProperty("/results", oval);

            this.suser = '';
            if (sap.ushell !== undefined) {
                this.suser = sap.ushell.Container.getService("UserInfo").getId();
            }
           


             this.stype = '';
            if (window.location.href.indexOf("zfiempclaimreq-monitor") !== -1) {
                this.stype = "admin";
                var sval={
                    employee: true
                };
                this.getOwnerComponent().getModel("Header").setProperty("/data",sval);
            }
            else if (window.location.href.indexOf("zfiempclaimreq-track") !== -1) {
                this.stype = "employee";
                var sval={
                    employee:false
                };
                this.getOwnerComponent().getModel("Header").setProperty("/data",sval);
            }
        },
        updateButton: function(Status,Belnr) {
            var bflag = false;
            if(Status === 'AP' && Belnr === ''){
                bflag = true;
            }
            return bflag;
        },
        onRepost: function(e) {
            debugger;
            var srow = e.getSource().getBindingContext().getObject();
            delete srow.__metadata;
            e.getSource().getParent().getCells()[0].setEnabled(false);

               this.showBusy(true);
                    this.getModel().create("/CRHRDITMSet", srow, {
                        method: "POST",
                        success: function (oData) {
                            this.showBusy(false);
                            
                        }.bind(this),
                        error: function (oError) {
                            this.showBusy(false);
                        }.bind(this)
                    });
        },
        onGoFilter: function() {
                
                var aFilters = [];
                var oModel =this.getOwnerComponent().getModel("LocalModel").getData().results;
                
                if(oModel.PernrTo !== ''){
                    var filter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.BT, oModel.PernrFrom,oModel.PernrTo);
                    aFilters.push(filter);
                }else if(oModel.PernrFrom !== ''){
                    var filter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, oModel.PernrFrom);
                    aFilters.push(filter);
                }

                if(oModel.ExpenseTo !== ''){
                    var filter = new sap.ui.model.Filter("Exptype", sap.ui.model.FilterOperator.BT, oModel.ExpenseFrom,oModel.ExpenseTo);
                    aFilters.push(filter);
                }else if(oModel.ExpenseFrom !== ''){
                    var filter = new sap.ui.model.Filter("Exptype", sap.ui.model.FilterOperator.EQ, oModel.ExpenseFrom);
                    aFilters.push(filter);
                }

                if(oModel.ClaimnoTo !== ''){
                    var filter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.BT, oModel.ClaimnoFrom,oModel.ClaimnoTo);
                    aFilters.push(filter);
                }else if(oModel.ClaimnoFrom !== ''){
                    var filter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, oModel.ClaimnoFrom);
                    aFilters.push(filter);
                }


                if(oModel.DateTo !== null){
                    var filter = new sap.ui.model.Filter("Crtdat", sap.ui.model.FilterOperator.BT, oModel.DateFrom,oModel.DateTo);
                    aFilters.push(filter);
                }else if(oModel.DateFrom !== null){
                    var filter = new sap.ui.model.Filter("Crtdat", sap.ui.model.FilterOperator.EQ, oModel.DateFrom);
                    aFilters.push(filter);
                }

                if(oModel.Status !== ''){
                    var filter = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, oModel.Status);
                    aFilters.push(filter);
                }

                
                var oPernr = this.getOwnerComponent().getModel("onpressPernr").getProperty("/results");
                var oExpense = this.getOwnerComponent().getModel("onpressExpenseTo").getProperty("/results");
                var oclaimno =this.getOwnerComponent().getModel("onpressClaimno").getProperty("/results");
                
                oPernr.forEach(function (oItem) {
                    if(oItem.Value !== ''){
                        var filter = new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, oItem.Value);
                        aFilters.push(filter);
                    }
                }.bind(this));
                
                oExpense.forEach(function (oItem) {
                    if(oItem.Value !== ''){
                        var filter = new sap.ui.model.Filter("Exptype", sap.ui.model.FilterOperator.EQ, oItem.Value);
                        aFilters.push(filter);
                    }
                }.bind(this));
                
                oclaimno.forEach(function (oItem) {
                    if(oItem.Value !== ''){
                        var filter = new sap.ui.model.Filter("Claimno", sap.ui.model.FilterOperator.EQ, oItem.Value);
                        aFilters.push(filter);
                    }
                }.bind(this));
                
                if(this.stype === "employee"){
                    var filter = new sap.ui.model.Filter("Crtby", sap.ui.model.FilterOperator.EQ, this.suser);
                        aFilters.push(filter);
                }
                
                return aFilters;
        },

        handleLinkPress: function (oevent) {
            
            var sclaimno = oevent.getSource().getProperty("text");
            var sstatus = '';//oevent.getSource().getParent().getCells()[16].getText() ; //to fetch status
            var scrtby = '';
            var oData = this.getView().getModel("tabledata").getProperty("/results");
            if (oData && oData.length > 0) {
                var selCurrncRow = oData.filter(function (el) {
                    return el.Claimno === sclaimno;
                });
            }
            if (selCurrncRow.length > 0) {
                sstatus = selCurrncRow[0].Status;
                scrtby = selCurrncRow[0].Crtby;
            } 

            if (sstatus === 'RE' &&
                this.suser === scrtby) {
                    var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");
                    var href = (xnavservice && xnavservice.hrefForExternal({
                        target: { semanticObject: "zfiempclaimreq", action: "create" },
                        params: { "Claimno": sclaimno }
                    })) || "";
                    
                    if (href.indexOf("&sap-app-origin-hint=") !== -1) {
                        href.replaceAll("&sap-app-origin-hint=", "");
                    }
                    var sval = href.split("?");
        
                    var finalUrl = window.location.href.split("#")[0] + "&"+sval[1]+sval[0];
                    
                    sap.m.URLHelper.redirect(finalUrl, true);
            }
            else{
                var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");
            var href = (xnavservice && xnavservice.hrefForExternal({
                target: { semanticObject: "zfiempclaimreq", action: "lookup" },
                params: { "Claimno": sclaimno }
            })) || "";
            if (href.indexOf("&sap-app-origin-hint=") !== -1) {
                href.replaceAll("&sap-app-origin-hint=", "");
            }
            var sval = href.split("?");
            var finalUrl = window.location.href.split("#")[0] + "&"+sval[1]+sval[0];            
            sap.m.URLHelper.redirect(finalUrl, true);
            }
            

            
        },
        onBeforeRebindTable: function(oEvent) {
            var oBindingParams = oEvent.getParameter("bindingParams");
            var aStandardFilters = oBindingParams.filters;
            var aCustomFilters = this.onGoFilter();
            oBindingParams.filters = aCustomFilters;
            this.getOdata("/CRHRDITMSet","tabledata",aCustomFilters);
        },
        onClear: function(oEvent) {
            var sval = {
                "PernrFrom": '',
                "PernrTo":'',
                "PernrRange":'',
                "Pernr":'',
                'ExpenseFrom':'',
                'ExpenseTo':'',
                'ClaimnoFrom':'',
                'ClaimnoTo':'',
                'DateFrom':'',
                'DateTo':'',
                'Status':''

            }
            this.getOwnerComponent().getModel("LocalModel").setProperty("/results",sval);
            this.getOwnerComponent().getModel("LocalModel").refresh();

            var sval={
                "Value":''
            }
            var oval=[];
            oval.push(sval);
            this.getOwnerComponent().getModel("onpressPernr").setProperty("/results",oval);
            this.getOwnerComponent().getModel("onpressClaimno").setProperty("/results",oval);
            this.getOwnerComponent().getModel("onpressExpenseTo").setProperty("/results",oval);
        },
        onPReqSearch: function(oEvent) {
            // Fetch a list of filters to apply to the worklist:
          var aFilters = this.buildFiltersForCustomFields();
            // Try to apply the filters:
           this.refreshTable();
        },
        refreshTable: function(oEvent){
            // if (this.getView().getModel("LocalModel").getData().results.PernrFrom === "") {
            //     MessageBox.error("Employee ID is mandatory");
            // }else{
            //     this.byId("smartTable").rebindTable();
            // } 
            
            this.byId("smartTable").rebindTable();
            
        },
        buildFiltersForCustomFields: function() {
            var oFilterBar = this.getView().byId("fbPreqs");
            var aFilters = [];
            oFilterBar.getFilterGroupItems().forEach(function (oItem) {
                var oControl = oItem.getControl();
                var sControlType = oControl.getMetadata().getName();

                switch (sControlType) {
                    case "sap.m.Input":
                        var sValue = oControl.getValue();
                        if (sValue && oItem.getName() !=='Bukrs') {
                            aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ, sValue));
                        }

                        break;
                    case "sap.m.ComboBox":
                        var sKey = oControl.getSelectedKey();
                        if (sKey) {
                            aFilters.push(new Filter(oItem.getName(), FilterOperator.EQ, sKey));
                        }

                        break;
                    case "sap.m.MultiInput":
                        var ovl = [];
                        var sfilterval = '';
                        if(oControl.getProperty("value") !== ''){
                            var ovl = oControl.getProperty("value").split(",");
                           for(var i = 0 ; i< ovl.length ; i++){
                            aFilters.push(new Filter('Proid', FilterOperator.EQ, ovl[i]));
                           }
                        } 
                        break;

                    case "sap.m.DateRangeSelection":
                        var oDateFrom = oControl.getDateValue();
                    var oDateTo = oControl.getSecondDateValue();

                    if (oDateTo) {
                        aFilters.push(new Filter("DateHigh", FilterOperator.EQ, oDateTo));
                    } 
                    if (oDateFrom) {
                        aFilters.push(new Filter("DateLow", FilterOperator.EQ, oDateFrom));
                    }

                        break;
                }
            });
            return aFilters;
        },
        _handleValueHelpPernr: function (evt) {
          //  var sInputValue = evt.getSource().getValue();
            if (!this._valueHelpDialogCCode) {
                this._valueHelpDialogCCode = sap.ui.xmlfragment("zfiempreport.fragment.Pernr_ValueHelp", this);
                this.getView().addDependent(this._valueHelpDialogCCode);
            }
            // create a filter for the binding
            //this._valueHelpDialogCCode.getBinding("items").filter([new sap.ui.model.Filter("Pernr", sap.ui.model.FilterOperator.EQ, sInputValue)]);

            // open value help dialog filtered by the input value
            this._valueHelpDialogCCode.open();
        },
        onPernOk: function (evt) {
            
            var opernrmodel = this.getOwnerComponent().getModel("LocalModel").getData().results;
            if(opernrmodel.PernrTo !== ''){
                var sPernrRange = opernrmodel.PernrFrom +" - "+opernrmodel.PernrTo;
            }else{
                var sPernrRange = opernrmodel.PernrFrom;
            }
            this.getOwnerComponent().getModel("LocalModel").getData().results.Pernr = sPernrRange;
            this.getOwnerComponent().getModel("LocalModel").refresh(true);
            this._valueHelpDialogCCode.close();
        },
    });
});