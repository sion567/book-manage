module Components.Navbar exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)

-- isActive: 判断高亮
-- userEmail: 如果登录了，显示用户名
type alias NavbarConfig msg =
    { activePage : String
    , userEmail : Maybe String
    , onLogout : msg
    }

view : NavbarConfig msg -> Html msg
view config =
    nav [ style "background-color" "#1e1e2d"
        , style "color" "white"
        , style "padding" "10px 20px"
        , style "display" "flex"
        , style "justify-content" "space-between"
        , style "align-items" "center"
        , style "box-shadow" "0 2px 5px rgba(0,0,0,0.1)"
        ]
        [ -- 左：Logo
          div [ style "font-size" "1.2rem", style "font-weight" "bold" ]
            [ text "📚 图书馆里系统" ]
            
        -- 右：用户信息等
        , div [ style "display" "flex", style "align-items" "center", style "gap" "20px" ]
            [ renderUserSection config ]
        ]

renderUserSection : NavbarConfig msg -> Html msg
renderUserSection config =
    case config.userEmail of
        Just email ->
            div [ style "display" "flex", style "gap" "15px", style "align-items" "center" ]
                [ span [ style "color" "#a2a3b7", style "font-size" "0.9rem" ] 
                    [ text ("当前用户: " ++ email) ]
                , button 
                    [ onClick config.onLogout
                    , style "background" "#ef233c"
                    , style "color" "white"
                    , style "border" "none"
                    , style "padding" "5px 12px"
                    , style "border-radius" "4px"
                    , style "cursor" "pointer"
                    ] 
                    [ text "退出" ]
                ]

        Nothing ->
            span [ style "font-style" "italic", style "color" "#888" ] 
                [ text "游客模式" ]