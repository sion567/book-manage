package com.example.demo.utils;

import com.example.demo.domain.Permission;

import java.util.Arrays;

public class SecurityUtils {
    // 将 Permission 枚举数组转为字符串数组
    public static String[] auths(Permission... permissions) {
        return Arrays.stream(permissions)
                .map(Permission::getPermission)
                .toArray(String[]::new);
    }
}
