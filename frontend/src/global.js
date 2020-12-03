// https://stackoverflow.com/questions/42862253/how-to-parse-query-string-in-react-router-v4
export const getQueryStringParams = (query) => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query)
      .split('&')
      .reduce((params, param) => {
          let [key, value] = param.split('=')
          params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : ''
          return params
        }, {}
      )
    : {}
}