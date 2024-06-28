const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5001;
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());



//COMMON UNIT

const fetchProcessTableData = require('./routes/Common/fetchProcessTableData.js')
const fetchDesignSuggData = require('./routes/Common/fetchDesignSugg.js')
const fetchJwAmt = require('./routes/Common/fetchJWamt.js')
const fetchSearchedData = require('./routes/Common/fetchSearchedData.js')
const fetchJobberDetails = require('./routes/Common/fetchJobberDetails.js')
const fetchMonthData = require('./routes/Common/fetchMonthWiseData.js')
const fetchPaymentStatus = require('./routes/Common/fetchPaymentStatus.js')

// ESTIAMTED CS

const unitNoRoute = require('./routes/fetchUnits')
const designNoRoute = require('./routes/fetchDesignNo.js')
const fetchAccounitgRoute = require('./routes/fetchAccounting')
const fetchProducPanelRoute = require('./routes/fetchProductPanel')
const fetchMaterialRoute = require('./routes/fetchMaterial')
const fetchJobworkRoute = require('./routes/fetchJobwork')
const fetchJobberDetRoute = require('./routes/fetchJobberDet')
const allDataRoute = require('./routes/fetchAll')
const storeInvoiceRoute = require('./routes/storeInvoice')
const addElementRoute = require('./routes/addElement')
const searchInvoiceRoute = require('./routes/searchInvoice')
const fetchHeaderRoute = require('./routes/fetchHeader')

const fetchDesignNoRoute = require('./routes/CuttingUnit/fetchDesignNo')
const fetchLotNoListRoute = require('./routes/CuttingUnit/fetchLotNoList')
const fetchRawMatListRoute = require('./routes/CuttingUnit/fetchRawMaterialData.js')
const fetchCuttingVchNoRoute = require('./routes/CuttingUnit/temVchNo.js')
const fetchRawMatDataRoute = require('./routes/CuttingUnit/fetchRawMaterial')
const fetchJobberAddressRoute = require('./routes/CuttingUnit/fetchJobberAddress')
//const fetchLotNoRoute = require('./routes/CuttingUnit/fetchLotNo')
const fetchUnitNo = require('./routes/CuttingUnit/fetchUnitAndGodown')
const storeCuttingInvoiceRoute = require('./routes/CuttingUnit/storeCuttingInvoice')
const searchCuttingInvoiceRoute = require('./routes/CuttingUnit/searchInvoice')

const fetchCuttingDesignRoute = require('./routes/SplitingUnit/fetchCuttingDesign')
const fetchDestinationDataRoute = require('./routes/SplitingUnit/fetchDestinationData')
const fetchSplitNoRoute = require('./routes/SplitingUnit/fetchSplitNo')
const fetchHeaderDataSplittingRoute = require('./routes/SplitingUnit/fetchHeaderData');
const fetchCuttingFreightRoute = require('./routes/SplitingUnit/fetchCuttig&freightVal')
const fetchSplitJobberDetRoute = require('./routes/SplitingUnit/fetchJobberDet')
const storeSplitingInvoiceRoute = require('./routes/SplitingUnit/invoiceSpliting')
const fetchItemNameRoute = require('./routes/SplitingUnit/fetchItemName')
const fetchMainGodownRoute = require('./routes/SplitingUnit/fetchMainGodown.js')
const searchSplitngInvoiceRoute = require('./routes/SplitingUnit/searchInvoice.js')


const fetchEmbIssJobberNameRoute = require('./routes/EMBISSunit/fetchJobberName')
const fetchEMBISSDesignNoDataRoute = require('./routes/EMBISSunit/fetchDesignNoEMBISS')
const fetchMisDesginRoute = require('./routes/EMBISSunit/fetchMisDesignNo')
const fetchSplitingValsRoute = require('./routes/EMBISSunit/fetchSplitingValues')
const fetchEMBISSvchNoDataRoute = require('./routes/EMBISSunit/fetchLastEMBISSno')
const fetchJwAmtRoute = require('./routes/EMBISSunit/fetchJwAmt')
const storeEmbIssInvoice = require('./routes/EMBISSunit/storeInvoiceEmbIss')

const fetchEMBRECvchNoDataRoute = require('./routes/EMBRECunit/fetchLastEMBREC')
const fetchEmbRecAllRoute = require('./routes/EMBRECunit/fetchJobberName')
const fetchEmbRecEcVchNoRoute = require('./routes/EMBRECunit/fetchEsVchNo')
const fetchEmbRecDesignDataRoute = require('./routes/EMBRECunit/fetchDesignData')
const fetchEmbRecSourceTableDataRoute = require('./routes/EMBRECunit/fetchSourceTableData')
const storeEmbRecInvoice = require('./routes/EMBRECunit/storeInvoiceEmbRec')

// FUSING ISS

const fetchFusingIssVchNoRoute = require('./routes/FusingIssUnit/fetchLastFusingIssNo')
const fetchDesignNoDataRoute = require('./routes/FusingIssUnit/fetchDesignNoData')
const fetchFusingIssJobberNameRoute = require('./routes/FusingIssUnit/fetchJobberName')
const fetchFusingIssMisDataRoute = require('./routes/FusingIssUnit/fetchMisDesignNo')
const fetchFusingIssLastOperationRoute = require('./routes/FusingIssUnit/fetchLastOperationData')
const fetchFusingIssJwAmtRoute = require('./routes/FusingIssUnit/fetchJwAmt')
const storeFusingIssInvoice = require('./routes/FusingIssUnit/storeInvoiceFusing')

// FUSING REC 

const fetchFusingRecVchNoRoute = require('./routes/FusingRecUnit/fetchLastFusingRecNo')
const fetchFusingRecJobberNameRoute = require('./routes/FusingRecUnit/fetchJobberName')
const fetchFusingRecEcVchNoRoute = require('./routes/FusingRecUnit/fetchEsVchNo')
const fetchFusingRecDesignNoRoute = require('./routes/FusingRecUnit/fetchDesignData')
const fetchFusingRecTableDataRoute = require('./routes/FusingRecUnit/fetchTableData')
const storeFusingRecInvoiceRoute = require('./routes/FusingRecUnit/storeInvoiceFusingRec.js')


// HANDWORK ISS

const fetchHwISSjNameRoute = require('./routes/HandWorkIssUnit/fetchJobberName')
const fetchHwISSLastHandNoRoute = require('./routes/HandWorkIssUnit/fetchLastHandNo')
const fetchHwIssTableData = require('./routes/HandWorkIssUnit/fetchHandWorkTableData')
const fetchHwISSdesignNoRoute = require('./routes/HandWorkIssUnit/fetchDesignNo')
const fetchHwISSmisDesignNORoute = require('./routes/HandWorkIssUnit/fetchMissDesignNo')
const storeHwISSInvoiceRoute = require('./routes/HandWorkIssUnit/storeInvoice')

const fetchHandworkRecVchNoRoute = require('./routes/HandWorkRecUnit/fetchLastFusingRecNo')
const fetchHandworkRecJobberNameRoute = require('./routes/HandWorkRecUnit/fetchJobberName')
const fetchHandworkRecEcVchNoRoute = require('./routes/HandWorkRecUnit/fetchEsVchNo')
const fetchHandworkRecDesignNoRoute = require('./routes/HandWorkRecUnit/fetchDesignData')
const fetchHandworkRecTableDataRoute = require('./routes/HandWorkRecUnit/fetchTableData')
const storeHandworkRecInvoiceRoute = require('./routes/HandWorkRecUnit/storeInvoiceHwRec.js')


// PLEATING ISS

const fetchPleatingISSjNameRoute = require('./routes/PleatingIssUnit/fetchJobberName')
const fetchPleatingISSLastHandNoRoute = require('./routes/PleatingIssUnit/fetchLastIssNo')
const fetchPleatingIssTableData = require('./routes/PleatingIssUnit/fetchTableData')
const fetchPleatingISSdesignNoRoute = require('./routes/PleatingIssUnit/fetchDesignNoData')
const fetchPleatingISSmisDesignNORoute = require('./routes/PleatingIssUnit/fetchMisDesignNo')
const storePleatingISSInvoiceRoute = require('./routes/PleatingIssUnit/storeInvoice')

// PLEATING REC

const fetchPleatingRecVchNoRoute = require('./routes/PleatingRECunit/fetchLastRecNo')
const fetchPleatingRecJobberNameRoute = require('./routes/PleatingRECunit/fetchJobberName')
const fetchPleatingRecEcVchNoRoute = require('./routes/PleatingRECunit/fetchEsVchNo')
const fetchPleatingRecDesignNoRoute = require('./routes/PleatingRECunit/fetchDesignData')
const fetchPleatingRecTableDataRoute = require('./routes/PleatingRECunit/fetchTableData')
const storePleatingRecInvoiceRoute = require('./routes/PleatingRECunit/storeInvoice')

// PRINTING ISS 

const fetchPrintingIssLastVchNoRoute = require('./routes/PrintingIssUnit/fetchLastPrintNo.js')
const fetchPrintIssMisDesignNoRoute = require('./routes/PrintingIssUnit/fetchMisDesignNo')
const fetchPrintingIssDesignNoRoute = require('./routes/PrintingIssUnit/fetchDesignNoData.js')
const fetchPrintingIssJobberNameRoute = require('./routes/PrintingIssUnit/fetchJobberName.js')
const storePrintingIssInvoiceRoute = require('./routes/PrintingIssUnit/storeInvoicePrint.js')

// PRINTING REC

const fetchPrintingRecVchNoRoute = require('./routes/PrintingRecUnit/fetchLastPrintRecNo')
const fetchPrintingRecJobberNameRoute = require('./routes/PrintingRecUnit/fetchJobberName')
const fetchPrintingRecEcVchNoRoute = require('./routes/PrintingRecUnit/fetchEsVchNo')
const fetchPrintingRecDesignNoRoute = require('./routes/PrintingRecUnit/fetchDesignData')
const fetchPrintingRecTableDataRoute = require('./routes/PrintingRecUnit/fetchTableData')
const storePrintingRecInvoiceRoute = require('./routes/PrintingRecUnit/storeInvoicePrintRec.js')

// STITCHING ISS 

const fetchStitchingIssLastVchNoRoute = require('./routes/StitchingIssUnit/fetchLastStitchingNo.js')
const fetchStitchingIssMisDesignNoRoute = require('./routes/StitchingIssUnit/fetchMisDesignNo')
const fetchStitchingIssDesignNoRoute = require('./routes/StitchingIssUnit/fetchDesignNoData.js')
const fetchStitchingIssJobberNameRoute = require('./routes/StitchingIssUnit/fetchJobberName.js')
const storeStitchingIssInvoiceRoute = require('./routes/StitchingIssUnit/storeInvoiceStitching.js')

// STITCHING REC

const fetchStitchingRecVchNoRoute = require('./routes/StitchingRecUnit/fetchLastStitchingRecNo')
const fetchStitchingRecJobberNameRoute = require('./routes/StitchingRecUnit/fetchJobberName')
const fetchStitchingRecEcVchNoRoute = require('./routes/StitchingRecUnit/fetchEsVchNo')
const fetchStitchingRecDesignNoRoute = require('./routes/StitchingRecUnit/fetchDesignData')
const fetchStitchingRecTableDataRoute = require('./routes/StitchingRecUnit/fetchTableData')
const storeStitchingRecInvoiceRoute = require('./routes/StitchingRecUnit/storeInvoiceStitchingRec.js')

// SMOKING ISS 

const fetchSmokingIssLastVchNoRoute = require('./routes/SmokingIssUnit/fetchLastNo.js')
const fetchSmokingIssMisDesignNoRoute = require('./routes/SmokingIssUnit/fetchMisDesignNo')
const fetchSmokingIssDesignNoRoute = require('./routes/SmokingIssUnit/fetchDesignNoData.js')
const fetchSmokingIssJobberNameRoute = require('./routes/SmokingIssUnit/fetchJobberName.js')
const storeSmokingIssInvoiceRoute = require('./routes/SmokingIssUnit/storeInvoice.js')

// SNOKING REC

const fetchSmokingRecVchNoRoute = require('./routes/SmokingRecUnit/fetchLastRecNo.js')
const fetchSmokingRecJobberNameRoute = require('./routes/SmokingRecUnit/fetchJobberName.js')
const fetchSmokingRecEcVchNoRoute = require('./routes/SmokingRecUnit/fetchEsVchNo')
const fetchSmokingRecDesignNoRoute = require('./routes/SmokingRecUnit/fetchDesignData')
const fetchSmokingRecTableDataRoute = require('./routes/SmokingRecUnit/fetchTableData')
const storeSmokingRecInvoiceRoute = require('./routes/SmokingRecUnit/storeInvoiceRec.js')

// WASHING ISS 

const fetchWashingIssLastVchNoRoute = require('./routes/WashingIssUnit/fetchLastWashingNo.js')
const fetchWashingIssMisDesignNoRoute = require('./routes/WashingIssUnit/fetchMisDesignNo')
const fetchWashingIssDesignNoRoute = require('./routes/WashingIssUnit/fetchDesignNoData.js')
const fetchWashingIssJobberNameRoute = require('./routes/WashingIssUnit/fetchJobberName.js')
const storeWashingIssInvoiceRoute = require('./routes/WashingIssUnit/storeInvoiceWashing.js')

// WASHING REC

const fetchWashingRecVchNoRoute = require('./routes/WashingRecUnit/fetchLastWashingRecNo.js')
const fetchWashingRecJobberNameRoute = require('./routes/WashingRecUnit/fetchJobberName')
const fetchWashingRecEcVchNoRoute = require('./routes/WashingRecUnit/fetchEsVchNo')
const fetchWashingRecDesignNoRoute = require('./routes/WashingRecUnit/fetchDesignData')
const fetchWashingRecTableDataRoute = require('./routes/WashingRecUnit/fetchTableData')
const storeWashingRecInvoiceRoute = require('./routes/WashingRecUnit/storeInvoiceWashingRec.js')

// REFINISHING ISS 

const fetchRefinishingIssLastVchNoRoute = require('./routes/RefinishingIssUnit/fetchLastRefinishingNo.js')
const fetchRefinishingIssMisDesignNoRoute = require('./routes/RefinishingIssUnit/fetchMisDesignNo')
const fetchRefinishingIssDesignNoRoute = require('./routes/RefinishingIssUnit/fetchDesignNoData.js')
const fetchRefinishingIssJobberNameRoute = require('./routes/RefinishingIssUnit/fetchJobberName.js')
const storeRefinishingIssInvoiceRoute = require('./routes/RefinishingIssUnit/storeInvoiceRefinishing.js')

// REFINISHING REC

const fetchRefinishingRecVchNoRoute = require('./routes/RefinishingRecUnit/fetchLastRefinishingRecNo')
const fetchRefinishingRecJobberNameRoute = require('./routes/RefinishingRecUnit/fetchJobberName')
const fetchRefinishingRecEcVchNoRoute = require('./routes/RefinishingRecUnit/fetchEsVchNo')
const fetchRefinishingRecDesignNoRoute = require('./routes/RefinishingRecUnit/fetchDesignData')
const fetchRefinishingRecTableDataRoute = require('./routes/RefinishingRecUnit/fetchTableData')
const storeRefinishingRecInvoiceRoute = require('./routes/RefinishingRecUnit/storeInvoiceRefinishingRec.js')

// SFG 
const fetchSfgVchNoRoute = require('./routes/SemiFinishedGoods/fetchLastVchNo.js')
const fetchDesignDataRoute = require('./routes/SemiFinishedGoods/fetchDesignNo.js');
const storeSfgInvoiceRoute = require('./routes/SemiFinishedGoods/invoice.js')

// IRONING ISS 

const fetchIroningIssTableDataRoute = require('./routes/IroningIssUnit/fetchTableData.js')
const fetchIroningIssMisDesignNoRoute = require('./routes/IroningIssUnit/fetchMisDesignNo')
const fetchIroningIssDesignNoRoute = require('./routes/IroningIssUnit/fetchDesignNoData.js')
const fetchIroningIssJobberNameRoute = require('./routes/IroningIssUnit/fetchJobberName.js')
const storeIroningIssInvoiceRoute = require('./routes/IroningIssUnit/storeInvoiceIroning.js')
const fetchIroningIssLastVchNoRoute = require('./routes/IroningIssUnit/fetchLastVchNo.js')
// IRONING REC

const fetchIroningRecLastVchNoRoute = require('./routes/IroningRecUnit/fetchLastIroningRecNo.js')
const fetchIroningRecJobberNameRoute = require('./routes/IroningRecUnit/fetchJobberName')
const fetchIroningRecEcVchNoRoute = require('./routes/IroningRecUnit/fetchEsVchNo')
const fetchIroningRecDesignNoRoute = require('./routes/IroningRecUnit/fetchDesignData')
const fetchIroningRecTableDataRoute = require('./routes/IroningRecUnit/fetchTableData')
const storeIroningRecInvoiceRoute = require('./routes/IroningRecUnit/storeInvoiceIroningRec.js')

//FINAL COSTING

const fetchFinalCostingLastVchRoute = require('./routes/FinalCosting/lastFinalCostNumber.js')
const fetchFinalCostingDesignListRoute = require('./routes/FinalCosting/fetchCuttingDesignNo.js')
const fetchFinalCostingCuttingTableDataRoute = require('./routes/FinalCosting/fetchCuttingTableData.js')
const fetchFinalCostingProcessTableRoute = require('./routes/FinalCosting/fetchProcessTableData')
const fetchFinalCostingEsTableRoute = require('./routes/FinalCosting/fetchEsTableData.js')
const storeFinalCostingInvoiceRoute = require('./routes/FinalCosting/storeInvoice.js')

//JOBBER BILL
const fetchJObberBillLastVchRoute = require('./routes/JobberBill/fetchLastVch.js')
const fetchJobberBillTasksRoute = require('./routes/JobberBill/fetchJobberTaskDetails.js')
const fetchJobberBillStateDetail = require('./routes/JobberBill/fetchStateDetails.js')
const fetchJobberBilltaxVals = require('./routes/JobberBill/fetchTaxDetails.js')
const storeJobberBillInvoiceRoute = require('./routes/JobberBill/invoice.js')
const fetchJobberBillMisData = require('./routes/JobberBill/fetchMisData.js')

//COMMON 

app.use('/data/common/processTabel',fetchProcessTableData)
app.use('/data/common/design_sugg', fetchDesignSuggData)
app.use('/data/common/jwRate', fetchJwAmt)
app.use('/data/common/jobberDetails', fetchJobberDetails)
app.use('/data/common/month_wise_data', fetchMonthData)
app.use('/search/common/invoice', fetchSearchedData)
app.use('/data/common/payment_status', fetchPaymentStatus);

app.use('/data/fetch_accounting',fetchAccounitgRoute)
app.use('/data/fetch_productpanel',fetchProducPanelRoute)
app.use('/data/fetch_material',fetchMaterialRoute)
app.use('/data/fetch_jobwork',fetchJobworkRoute)
app.use('/data/fetch_jobberdetails',fetchJobberDetRoute)
app.use('/data/unit_no',unitNoRoute)
app.use('/data/design_no',designNoRoute)
app.use('/data/all',allDataRoute)
app.use('/save/invoice',storeInvoiceRoute)
app.use('/save/element', addElementRoute)
app.use('/search/invoice', searchInvoiceRoute)
app.use('/data/header',fetchHeaderRoute)


app.use('/data/fetch_designNo', fetchDesignNoRoute)
app.use('/data/fetch_lotNo_List', fetchLotNoListRoute)
app.use('/data/fetch_vchNo', fetchCuttingVchNoRoute)
app.use('/data/fetch_rawMaterial', fetchRawMatDataRoute)
app.use('/data/fetch_jobber_address', fetchJobberAddressRoute)
//app.use('/data/fetch_lotNo',fetchLotNoRoute)
app.use('/data/fetch_rawMat_list', fetchRawMatListRoute)
app.use('/data/fetch_unitNo',fetchUnitNo)
app.use('/save/cutting_invoice', storeCuttingInvoiceRoute)
app.use('/search/cutting/invoice',searchCuttingInvoiceRoute)

app.use('/data/spliting/designData', fetchCuttingDesignRoute);
app.use('/data/spliting/destinationData', fetchDestinationDataRoute);
app.use('/data/spliting/splitNo',fetchSplitNoRoute)
app.use('/data/spliting/item_name', fetchItemNameRoute)
app.use('/data/spliting/HeaderData', fetchHeaderDataSplittingRoute)
app.use('/data/spliting/cutiing_freightData', fetchCuttingFreightRoute)
app.use('/data/spliting/fetch_jobber_name', fetchSplitJobberDetRoute)
app.use('/save/spliting/spliting_invoice', storeSplitingInvoiceRoute)
app.use('/search/spliting/invoice', searchSplitngInvoiceRoute)
app.use('/data/spliting/main_godown', fetchMainGodownRoute)

app.use('/data/EmbIss/jobber_name', fetchEmbIssJobberNameRoute)
app.use('/data/EmbIss/designNo_data', fetchEMBISSDesignNoDataRoute)
app.use('/data/EmbIss/misDesign', fetchMisDesginRoute);
app.use('/data/EmbIss/splitingTable_values', fetchSplitingValsRoute)
app.use('/data/EmbIss/data/last_EMBissNo',fetchEMBISSvchNoDataRoute)
app.use('/data/EmbIss/jwAmt',fetchJwAmtRoute);
app.use('/save/EmbIss/invoice',storeEmbIssInvoice)


app.use('/data/EmbRec/data/last_EMBrecNo',fetchEMBRECvchNoDataRoute)
app.use('/data/EmbRec/fetchJobberNames', fetchEmbRecAllRoute)
app.use('/data/EmbRec/ecVchNo', fetchEmbRecEcVchNoRoute)
app.use('/data/EmbRec/fetch_design_data',fetchEmbRecDesignDataRoute)
app.use('/data/EmbRec/fetch_source_table_data', fetchEmbRecSourceTableDataRoute)
app.use('/save/EmbRec/invoice',storeEmbRecInvoice)

//FUSING ISS

app.use('/data/FusingIss/last_vchNo',fetchFusingIssVchNoRoute);
app.use('/data/FusingIss/designNo_data',fetchDesignNoDataRoute)
app.use('/data/FusignIss/mis_designNo', fetchFusingIssMisDataRoute);
app.use('/data/FusingIss/jobber_name',fetchFusingIssJobberNameRoute);
app.use('/data/FusingIss/last_operationData',fetchFusingIssLastOperationRoute)
app.use('/data/FusingIss/jwAmt',fetchFusingIssJwAmtRoute)
app.use('/save/FusingIss/invoice',storeFusingIssInvoice)


// fUSING REC
app.use('/data/FusingRec/last_vchNo', fetchFusingRecVchNoRoute)
app.use('/data/FusingRec/jobberName',fetchFusingRecJobberNameRoute)
app.use('/data/FusingRec/ecVchNo', fetchFusingRecEcVchNoRoute)
app.use('/data/FusingRec/designNo',fetchFusingRecDesignNoRoute)
app.use('/data/FusingRec/tabelData', fetchFusingRecTableDataRoute)
app.use('/save/FusingRec/invoice', storeFusingRecInvoiceRoute);


// HANDWORK ISS

app.use('/data/HwIss/last_vchNo', fetchHwISSLastHandNoRoute)
app.use('/data/HwIss/tableData', fetchHwIssTableData)
app.use('/data/HwIss/designNo_data', fetchHwISSdesignNoRoute)
app.use('/data/HwIss/jobber_name',fetchHwISSjNameRoute)
app.use('/data/HwIss/mis_designNo',fetchHwISSmisDesignNORoute)
app.use('/save/HwIss/storeInvoice', storeHwISSInvoiceRoute)

//HANDWORK REC
app.use('/data/HandworkRec/last_vchNo', fetchHandworkRecVchNoRoute)
app.use('/data/HandworkRec/jobberName',fetchHandworkRecJobberNameRoute)
app.use('/data/HandworkRec/ecVchNo', fetchHandworkRecEcVchNoRoute)
app.use('/data/HandworkRec/designNo',fetchHandworkRecDesignNoRoute)
app.use('/data/HandworkRec/tabelData', fetchHandworkRecTableDataRoute)
app.use('/save/HandworkRec/invoice', storeHandworkRecInvoiceRoute);

//PLEATING ISS

app.use('/data/pleatingIss/last_vchNo', fetchPleatingISSLastHandNoRoute)
app.use('/data/pleatingIss/tableData', fetchPleatingIssTableData)
app.use('/data/pleatingIss/designNo_data', fetchPleatingISSdesignNoRoute)
app.use('/data/pleatingIss/jobber_name',fetchPleatingISSjNameRoute)
app.use('/data/pleatingIss/mis_designNo',fetchPleatingISSmisDesignNORoute)
app.use('/save/pleatingIss/storeInvoice', storePleatingISSInvoiceRoute)

//PLEATING REC

app.use('/data/pleatingRec/last_vchNo', fetchPleatingRecVchNoRoute)
app.use('/data/pleatingRec/jobberName',fetchPleatingRecJobberNameRoute)
app.use('/data/pleatingRec/ecVchNo', fetchPleatingRecEcVchNoRoute)
app.use('/data/pleatingRec/designNo',fetchPleatingRecDesignNoRoute)
app.use('/data/pleatingRec/tabelData', fetchPleatingRecTableDataRoute)
app.use('/save/pleatingRec/invoice', storePleatingRecInvoiceRoute);

//PRINTING ISS

app.use('/data/printingIss/last_vchNo', fetchPrintingIssLastVchNoRoute);
app.use('/data/printingIss/jobber_name', fetchPrintingIssJobberNameRoute);
app.use('/data/PrintingIss/mis_designNo', fetchPrintIssMisDesignNoRoute);
app.use('/data/printingIss/designNo_data', fetchPrintingIssDesignNoRoute);
app.use('/save/printingIss/storeInvoice', storePrintingIssInvoiceRoute)

// PRINTING REC

app.use('/data/PrintingRec/last_vchNo', fetchPrintingRecVchNoRoute)
app.use('/data/PrintingRec/jobber_name',fetchPrintingRecJobberNameRoute)
app.use('/data/PrintingRec/ecVchNo', fetchPrintingRecEcVchNoRoute)
app.use('/data/PrintingRec/designNo', fetchPrintingRecDesignNoRoute)
app.use('/data/PrintingRec/tabelData', fetchPrintingRecTableDataRoute)
app.use('/save/PrintingRec/invoice', storePrintingRecInvoiceRoute);

//STITCHING ISS 

app.use('/data/StitchingIss/last_vchNo', fetchStitchingIssLastVchNoRoute);
app.use('/data/StitchingIss/jobber_name', fetchStitchingIssJobberNameRoute);
app.use('/data/StitchingIss/mis_designNo', fetchStitchingIssMisDesignNoRoute);
app.use('/data/StitchingIss/designNo_data', fetchStitchingIssDesignNoRoute);
app.use('/save/StitchingIss/storeInvoice', storeStitchingIssInvoiceRoute)

// STITCHING REC

app.use('/data/StitchingRec/last_vchNo', fetchStitchingRecVchNoRoute)
app.use('/data/StitchingRec/jobber_name',fetchStitchingRecJobberNameRoute)
app.use('/data/StitchingRec/ecVchNo', fetchStitchingRecEcVchNoRoute)
app.use('/data/StitchingRec/designNo', fetchStitchingRecDesignNoRoute)
app.use('/data/StitchingRec/tabelData', fetchStitchingRecTableDataRoute)
app.use('/save/StitchingRec/invoice', storeStitchingRecInvoiceRoute);

//SMOKING ISS 

app.use('/data/SmokingIss/last_vchNo', fetchSmokingIssLastVchNoRoute);
app.use('/data/SmokingIss/jobber_name', fetchSmokingIssJobberNameRoute);
app.use('/data/SmokingIss/mis_designNo', fetchSmokingIssMisDesignNoRoute);
app.use('/data/SmokingIss/designNo_data', fetchSmokingIssDesignNoRoute);
app.use('/save/SmokingIss/storeInvoice', storeSmokingIssInvoiceRoute)

// SMOKING REC

app.use('/data/SmokingRec/last_vchNo', fetchSmokingRecVchNoRoute)
app.use('/data/SmokingRec/jobber_name',fetchSmokingRecJobberNameRoute)
app.use('/data/SmokingRec/ecVchNo', fetchSmokingRecEcVchNoRoute)
app.use('/data/SmokingRec/designNo', fetchSmokingRecDesignNoRoute)
app.use('/data/SmokingRec/tabelData', fetchSmokingRecTableDataRoute)
app.use('/save/SmokingRec/invoice', storeSmokingRecInvoiceRoute);

//WASHING ISS 

app.use('/data/WashingIss/last_vchNo', fetchWashingIssLastVchNoRoute);
app.use('/data/WashingIss/jobber_name', fetchWashingIssJobberNameRoute);
app.use('/data/WashingIss/mis_designNo', fetchWashingIssMisDesignNoRoute);
app.use('/data/WashingIss/designNo_data', fetchWashingIssDesignNoRoute);
app.use('/save/WashingIss/storeInvoice', storeWashingIssInvoiceRoute)

// WASHING REC

app.use('/data/WashingRec/last_vchNo', fetchWashingRecVchNoRoute)
app.use('/data/WashingRec/jobber_name',fetchWashingRecJobberNameRoute)
app.use('/data/WashingRec/ecVchNo', fetchWashingRecEcVchNoRoute)
app.use('/data/WashingRec/designNo', fetchWashingRecDesignNoRoute)
app.use('/data/WashingRec/tabelData', fetchWashingRecTableDataRoute)
app.use('/save/WashingRec/invoice', storeWashingRecInvoiceRoute);

//REFINISHING ISS 

app.use('/data/RefinishingIss/last_vchNo', fetchRefinishingIssLastVchNoRoute);
app.use('/data/RefinishingIss/jobber_name', fetchRefinishingIssJobberNameRoute);
app.use('/data/RefinishingIss/mis_designNo', fetchRefinishingIssMisDesignNoRoute);
app.use('/data/RefinishingIss/designNo_data', fetchRefinishingIssDesignNoRoute);
app.use('/save/RefinishingIss/storeInvoice', storeRefinishingIssInvoiceRoute)

// REFINISHING REC

app.use('/data/RefinishingRec/last_vchNo', fetchRefinishingRecVchNoRoute)
app.use('/data/RefinishingRec/jobber_name',fetchRefinishingRecJobberNameRoute)
app.use('/data/RefinishingRec/ecVchNo', fetchRefinishingRecEcVchNoRoute)
app.use('/data/RefinishingRec/designNo', fetchRefinishingRecDesignNoRoute)
app.use('/data/RefinishingRec/tabelData', fetchRefinishingRecTableDataRoute)
app.use('/save/RefinishingRec/invoice', storeRefinishingRecInvoiceRoute);

// SEMI FINISHED GOODS

app.use('/data/SFG/last_vchNo', fetchSfgVchNoRoute);
app.use('/data/SFG/designData',fetchDesignDataRoute);
app.use('/save/SFG/invoice', storeSfgInvoiceRoute);

// IRONING ISS
app.use('/data/IroningIss/lastVch_no', fetchIroningIssLastVchNoRoute)
app.use('/data/IroningIss/jobber_name', fetchIroningIssJobberNameRoute);
app.use('/data/IroningIss/designNo_data',fetchIroningIssDesignNoRoute);
app.use('/data/IroningIss/tabelData', fetchIroningIssTableDataRoute)
app.use('/save/IroningIss/invoice', storeIroningIssInvoiceRoute)

// IRONING REC

app.use('/data/IroningRec/lastVch_no', fetchIroningRecLastVchNoRoute)
app.use('/data/IroningRec/jobber_name',fetchIroningRecJobberNameRoute)
app.use('/data/IroningRec/designNo_data', fetchIroningRecDesignNoRoute)
app.use('/data/IroningRec/tableData', fetchIroningRecTableDataRoute)
app.use('/data/IroningRec/esVch', fetchIroningRecEcVchNoRoute)
app.use('/save/IroningRec/invoice', storeIroningRecInvoiceRoute)

//FINAL COSTING

app.use('/data/FinalCosting/lastVch_no',fetchFinalCostingLastVchRoute)
app.use('/data/FinalCosting/designNo_list',fetchFinalCostingDesignListRoute)
app.use('/data/FinalCosting/cutting_table_data', fetchFinalCostingCuttingTableDataRoute)
app.use('/data/FinalCosting/process_table_data',fetchFinalCostingProcessTableRoute)
app.use('/data/FinalCosting/Es_table_data', fetchFinalCostingEsTableRoute)
app.use('/save/FinalCosting/invoice', storeFinalCostingInvoiceRoute)

// JOBBER BILL
app.use('/data/jobberBill/lastVch_no', fetchJObberBillLastVchRoute)
app.use('/data/jobberBill/jobber_task_details', fetchJobberBillTasksRoute)
app.use('/data/jobberBill/state_details',fetchJobberBillStateDetail)
app.use('/data/jobberBill/tax_val', fetchJobberBilltaxVals)
app.use('/data/jobberBill/mis_data', fetchJobberBillMisData)
app.use('/store/jobberBill/invoice', storeJobberBillInvoiceRoute)


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});