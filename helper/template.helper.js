

function ResponseTemplate(data, message, error, status, meta = null) {
    return {
        data,
        message,
        error,
        status,
        meta,
    }
}



module.exports = {
    ResponseTemplate
}