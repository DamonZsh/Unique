/**
 * Created by damon.zhang on 2016/9/9.
 */



var post = function () {

    var pValue = $('#posterEmail').val();
    var reg =/^[A-Za-z0-9]+$/;
    if(!reg.test(pValue)){
        $('#alert').show();
    }
    var rValue = $('#receiverEmails').val();
    $('#demo-upload').submit();
}

var resetForm = function () {
    console.info("Clear the fomr");
    $("#infoform").clear;
}