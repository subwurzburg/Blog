//分頁
const page = function (Resource,CurrentPage) {

    const totalResult = Resource.length;
    const perPage = 3; //每頁頁數
    const PageTotal = Math.ceil(totalResult / perPage);
    if (CurrentPage > PageTotal) {
        CurrentPage = PageTotal;
    }

    const firstData = (CurrentPage * perPage) - perPage + 1 //當頁的第一筆資料1
    const finalData = CurrentPage * perPage //當頁的最後一筆資料3
    const data = [];
    Resource.forEach(function (item, i) {
        let articleNum = i + 1;
        if (articleNum >= firstData && finalData >= articleNum) {
            data.push(item);
        }
    })
    const pagination = { PageTotal, CurrentPage, hasPre: CurrentPage > 1, hasNext: CurrentPage < PageTotal }
    return {pagination,data}
}

module.exports = page ;