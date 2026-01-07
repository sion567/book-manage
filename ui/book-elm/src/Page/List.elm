module Page.List exposing (Model, Msg(..), init, update, view)

import Api.Book exposing (Book)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)
import Http
import Time

-- 特色：用联合类型消除“非法状态”
type RemoteData
    = NotAsked          -- 还没开始求
    | Loading           -- 加载中
    | Success (List Book) -- 成功，且带有数据
    | Failure String    -- 失败，带有错误信息

type alias Model =
    { books : RemoteData }

init : ( Model, Cmd Msg )
init =
    ( { books = NotAsked }, Cmd.none )

type Msg
    = ClickFetch
    | GotBooks (Result Http.Error (List Book))

-- update 签名，String 类型的 token 参数...
update : String -> Msg -> Model -> ( Model, Cmd Msg )
update token msg model =
    case msg of
        ClickFetch ->
            ( { model | books = Loading }, Api.Book.fetchBooks token GotBooks )

        GotBooks result ->
            case result of
                Ok data ->
                    ( { model | books = Success data }, Cmd.none )

                Err _ ->
                    ( { model | books = Failure "网络同步失败，请检查后端" }, Cmd.none )

-- 辅助函数：格式化价格 (使用管道)
formatPrice : Float -> String
formatPrice price =
    price
        |> String.fromFloat
        |> (\s -> "￥" ++ s)
        |> (\s -> if String.length s < 5 then s ++ "0" else s) -- 确保两位小数（简化版）

-- 辅助函数
formatDate : String -> String
formatDate date =
    date
        |> (\s -> "出版于: " ++ s)

-- 輔助函數
monthToInt : Time.Month -> Int
monthToInt month =
    case month of
        Time.Jan -> 1
        Time.Feb -> 2
        Time.Mar -> 3
        Time.Apr -> 4
        Time.May -> 5
        Time.Jun -> 6
        Time.Jul -> 7
        Time.Aug -> 8
        Time.Sep -> 9
        Time.Oct -> 10
        Time.Nov -> 11
        Time.Dec -> 12

-- 视图逻辑：编译器强制你处理所有 RemoteData 的分支
view : Model -> Html Msg
view model =
    div [ style "padding" "20px" ]
        [ h2 [] [ text "图书监控中心" ]
        , case model.books of
            NotAsked ->
                button [ onClick ClickFetch, btnStyle ] [ text "获取最新图书列表" ]

            Loading ->
                div [ style "color" "#4361ee" ] [ text "正在建立安全连接并同步数据..." ]

            Success books ->
                div []
                    [ text ("共找到 " ++ (String.fromInt (List.length books)) ++ " 本图书")
                    , ul [] (List.map renderBook books)
                    ]

            Failure err ->
                div [ style "color" "#ef233c" ] [ text err ]
        ]

renderBook : Book -> Html Msg
renderBook book =
    li [ style "margin-bottom" "10px" ]
        [ strong [] [ text book.title ]
        , span [ style "color" "#888" ] [ text (" - " ++ book.author) ]
        , div [ style "margin-top" "5px", style "font-size" "0.8rem" ]
            [ span [] [ book.price |> formatPrice |> text ]
            , text " | "
            , span [] [ book.publicationDate |> formatDate |> text ]
            ]
        ]

btnStyle : Attribute msg
btnStyle = style "padding" "10px 20px"

batch : List (Attribute msg) -> Attribute msg
batch attrs = attribute "style" (String.join ";" (List.map (\a -> Debug.toString a) attrs)) -- 修正 batch 辅助函数，或直接使用列表
