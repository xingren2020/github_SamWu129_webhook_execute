var baseUrl='http://api.turinglabs.net/api/v1/jd/';

function init(content){
    
}
function request(type,shareCode){
    $.get({url:baseUrl+type+'/create/'+shareCode+'/'}, (err, resp, data) => {})
}
