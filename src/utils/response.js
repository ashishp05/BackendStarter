// successResponse({ message, result }: SuccessResponseParams): {
//     code: number
//     message: string
//     data: any
//   }

//   errorResponse({ code, message, result }: ErrorResponseParams): {
//     code: number
//     message: string
//     data: any
//   }

exports.responseJson = {
    success: (message, result, code) => {
        return {
            code: 200,
            result: result,
            message: message,
        };
    },

    error: (message, code) => {
        return {
            code: 500,
            message: message,
        };
    },
};
