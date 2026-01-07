module Api.Book exposing (Book, fetchBooks)

import Http
import Json.Decode as Decode exposing (Decoder, float, int, list, string)

-- 定义图书类型
type alias Book =
    { id : Int
    , title : String
    , author : String
    , price : Float
    , publicationDate : String
    }

-- 定义 JSON 解析器：如果后端返回格式不符，编译时或解析时会立即拦截
bookDecoder : Decoder Book
bookDecoder =
    Decode.map5 Book
        (Decode.field "id" int)
        (Decode.field "title" string)
        (Decode.field "author" string)
        (Decode.field "price" float)
        (Decode.field "publicationDate" string)

-- 发送指令：函数本身不执行请求，只是告诉 Elm 运行时去执行
fetchBooks : String -> (Result Http.Error (List Book) -> msg) -> Cmd msg
fetchBooks token expectMsg =
    Http.request
        { method = "GET"
        , url = "http://localhost:8080/api/v1/books"
        , body = Http.emptyBody
        , expect = Http.expectJson expectMsg (list bookDecoder)
        , timeout = Nothing
        , tracker = Nothing
        , headers = [ Http.header "Authorization" ("Bearer " ++ token) ]
        }