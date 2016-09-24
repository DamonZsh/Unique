/**
 * Created by damon.zhang on 2016/9/9.
 */


Dropzone.options.demoUpload = {
    url : "/uploadFiles",
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 10000, // MB
    maxFiles:50,
    uploadMultiple: true,
    autoProcessQueue: false,
    parallelUploads: 50,
    addRemoveLinks: true,
    dictRemoveLinks: "x",
    dictCancelUpload: "x",
    accept: function (file, done) {
        if (file.name == "justinbieber.jpg") {
            done("Naha, you don't.");
        } else {
            done();
        }
    },
    init: function () {
        var submitButton = document.querySelector("#submit-all")
        demoUpload = this; // closure
        submitButton.addEventListener("click", function() {
            $('#email0').val($('#posterEmail').val());
            $('#email1').val($('#receiverEmails').val());
            $('#duration0').val($('#duration').val());
            demoUpload.processQueue(); // Tell Dropzone to process all queued files.
        });
        this.on("addedfile", function(file){
       //     file.previewElement = Dropzone.createElement(this.options.previewTemplate);
            $('#submit-all').removeAttr('disabled');
        });
    }
};

var validate = function() {
    var pValue = $('#posterEmail').val();
    var reg0 =/^[A-Za-z0-9]+$/;
    if(isEmpty(pValue) || !reg0.test(pValue)){
        $('#alert').alert();
        return "error";
    }
    var rValues = $('#receiverEmails').val();
    var reg1 = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    var rValue = rValues.split(';');
    if(isEmpty(rValues)){
        $('#alert').alert();
        return "error";
    }
    for(var i = 0 ; i < rValue.size; i ++){
        if(!reg1.test(rValue[i])){
            $('#alert').alert();
            return "error";
        }
    }
    if(isEmpty($('#duration').val())){
        $('#alert').alert();
        return "error";
    }
    // $('#confirmModal').modal('show');
}

var isEmpty = function (param) {
    return param==null || param == undefined || param.trim() == "";
}
