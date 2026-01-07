module Api.Auth exposing (AuthResponse, loginRequest)

import Http
import Json.Decode as Decode
import Json.Encode as Encode

-- 定义后端返回的 Token 结构
type alias AuthResponse =
    { accessToken : String
    , refreshToken : String
    }

-- 定义登录请求函数
loginRequest : { email : String, password : String } -> (Result Http.Error AuthResponse -> msg) -> Cmd msg
loginRequest credentials toMsg =
    Http.post
        { url = "http://localhost:8080/api/v1/auth/authenticate"
        , body = Http.jsonBody (encoder credentials)
        , expect = Http.expectJson toMsg decoder
        }

-- 内部：将数据转换为 JSON
encoder : { email : String, password : String } -> Encode.Value
encoder creds =
    Encode.object
        [ ( "email", Encode.string creds.email )
        , ( "password", Encode.string creds.password )
        ]

-- 内部：解析后端返回的 JSON
decoder : Decode.Decoder AuthResponse
decoder =
    Decode.map2 AuthResponse
        (Decode.field "access_token" Decode.string)
        (Decode.field "refresh_token" Decode.string)
