/**
 * Created by damon.zhang on 2016/9/9.
 */



function post() {
    var pValue = $('#posterEmail').val();
    var reg0 =/^[A-Za-z0-9]+$/;
    if(isEmpty(pValue) || !reg0.test(pValue)){
        $('#alert').show();
        return;
    }
    var rValues = $('#receiverEmails').val();
    var reg1 = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    var rValue = rValues.split(';');
    if(isEmpty(rValues)){
        $('#alert').show();
        return;
    }
    for(var i = 0 ; i < rValue.size; i ++){
        if(!reg1.test(rValue[i])){
            $('#alert').show();
            return;
        }
    }
    if(isEmpty($('#duration').val())){
        $('#alert').show();
        return;
    }
    $('#confirmModal').modal('show');
}

var isEmpty = function (param) {
    return param==null || param == undefined || param.trim() == "";
}

var hideAlert = function(){
    $('#alert').hide();
}