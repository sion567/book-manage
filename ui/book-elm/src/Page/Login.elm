module Page.Login exposing (Model, Msg, Status(..), init, update, view)

import Api.Auth exposing (AuthResponse)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput, onClick)
import Http

-- 1. MODEL
type Status
    = Idle
    | Loading
    | Failure String
    | Success String

type alias Model =
    { email : String
    , password : String
    , status : Status
    }

init : ( Model, Cmd Msg )
init =
    ( { email = "", password = "", status = Idle }, Cmd.none )

-- 2. UPDATE
type Msg
    = UpdateEmail String
    | UpdatePassword String
    | SubmitForm
    | GotAuthResult (Result Http.Error AuthResponse)

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UpdateEmail val ->
            ( { model | email = val }, Cmd.none )

        UpdatePassword val ->
            ( { model | password = val }, Cmd.none )

        SubmitForm ->
            ( { model | status = Loading }
            , Api.Auth.loginRequest 
                { email = model.email, password = model.password } 
                GotAuthResult 
            )

        GotAuthResult result ->
            case result of
                Ok authResponse ->
                    -- 登录成功，状态转为 Success（Main.elm 监听此状态执行跳转）
                    ( { model | status = Success authResponse.accessToken }, Cmd.none )

                Err _ ->
                    ( { model | status = Failure "登录失败" }, Cmd.none )

-- 3. VIEW
view : Model -> Html Msg
view model =
    div [ class "login-container" ]
        [ h2 [] [ text "图书管理系统 - 登录" ]
        , div [ class "form-group" ]
            [ label [] [ text "邮箱" ]
            , input [ type_ "email", onInput UpdateEmail, placeholder "请输入邮箱" ] []
            ]
        , div [ class "form-group" ]
            [ label [] [ text "密码" ]
            , input [ type_ "password", onInput UpdatePassword, placeholder "请输入密码" ] []
            ]
        , renderStatus model.status
        , button 
            [ onClick SubmitForm
            , disabled (model.status == Loading)
            , style "background-color" (if model.status == Loading then "#ccc" else "#4361ee")
            ] 
            [ text (if model.status == Loading then "登录中..." else "登录") ]
        ]

renderStatus : Status -> Html msg
renderStatus status =
    case status of
        Failure err -> div [ style "color" "red" ] [ text err ]
        Success res -> div [ style "color" "green" ] [ text "验证成功，跳转中..." ]
        _ -> text ""

-- 简单内联样式定义
class : String -> Attribute msg
class name = attribute "class" name
