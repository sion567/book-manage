module Main exposing (main)

import Browser
import Page.List
import Page.Login
import Components.Navbar
import Html exposing (Html, div, nav, text)
import Html.Attributes exposing (style)

type Page
    = LoginPage Page.Login.Model
    | ListPage Page.List.Model

type alias Model =
    { currentPage : Page,
      accessToken : Maybe String
    }

init : () -> ( Model, Cmd Msg )
init _ =
    let
        -- 启动时进入登录页
        ( loginModel, loginCmd  ) = Page.Login.init
    in
    ( { currentPage = LoginPage loginModel, accessToken = Nothing }, Cmd.none)

-- 统一的消息分发
type Msg
    = ListMsg Page.List.Msg    -- 处理列表页消息
    | LoginMsg Page.Login.Msg  -- 处理登录页消息
    | LogoutClicked            -- <--- 登出

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ListMsg subMsg ->
            -- List page
            case ( model.currentPage, model.accessToken ) of
                ( ListPage listModel, Just token ) ->
                    let
                        ( newListModel, newListCmd ) =
                            Page.List.update token subMsg listModel
                    in
                    ( { model | currentPage = ListPage newListModel }
                    , Cmd.map ListMsg newListCmd
                    )

                ( _, Nothing ) ->
                    ( { model | currentPage = LoginPage (Tuple.first Page.Login.init) }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        LoginMsg subMsg ->
            -- Login page
            case model.currentPage of
                LoginPage loginModel ->
                    let
                        ( newLoginModel, newLoginCmd ) =
                            Page.Login.update subMsg loginModel
                    in
                    case newLoginModel.status of
                        Page.Login.Success token ->
                            let
                                ( newListModel, newListCmd ) =
                                    Page.List.init
                            in
                            ( { model
                                | accessToken = Just token
                                , currentPage = ListPage newListModel
                              }
                            , Cmd.map ListMsg newListCmd
                            )

                        -- Status 不是 Success 的情况 (Idle, Loading, Failure)
                        _ ->
                            ( { model | currentPage = LoginPage newLoginModel }
                            , Cmd.map LoginMsg newLoginCmd
                            )

                --  currentPage 不是 LoginPage 但收到 LoginMsg 的极端情况
                _ ->
                    ( model, Cmd.none )

        LogoutClicked ->
            let
                ( newLoginModel, newLoginCmd ) =
                    Page.Login.init
            in
            ( { model
                | currentPage = LoginPage newLoginModel
                , accessToken = Nothing
              }
            , Cmd.map LoginMsg newLoginCmd
            )

-- 渲染时根据当前页面类型调用对应的 view
view : Model -> Html Msg
view model =
    div []
        [ Components.Navbar.view
            { activePage = "Home" -- 根据 model.currentPage 判断
            , userEmail = Nothing -- 登录成功后从 model 获取
            , onLogout = LogoutClicked -- 在 Main.Msg 中定义的消息
            }
        , div [ style "padding" "20px" ] [ renderPage model ]
        ]
    

-- 这个函数用来保持 view 函数的整洁
renderPage : Model -> Html Msg
renderPage model =
    case model.currentPage of
        LoginPage loginModel ->
            -- 将子页面的 Html Msg 转换为 Main 的 Msg
            Html.map LoginMsg (Page.Login.view loginModel)

        ListPage listModel ->
            Html.map ListMsg (Page.List.view listModel)


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = \_ -> Sub.none
        , view = view
        }
