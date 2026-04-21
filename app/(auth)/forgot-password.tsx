import images from "@/constants/images";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function ForgotPassword() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onRequestReset = async () => {
    setErrorMessage("");
    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
      });
      if (createError) {
        console.error(JSON.stringify(createError, null, 2));
        setErrorMessage(
          createError.errors?.[0]?.message || "An error occurred",
        );
        return;
      }

      const { error: sendCodeError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendCodeError) {
        console.error(JSON.stringify(sendCodeError, null, 2));
        setErrorMessage(
          sendCodeError.errors?.[0]?.message || "An error occurred",
        );
        return;
      }

      setCodeSent(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.errors?.[0]?.message || err.message || "An error occurred",
      );
    }
  };

  const onVerifyCode = async () => {
    setErrorMessage("");
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        setErrorMessage(error.errors?.[0]?.message || "An error occurred");
        return;
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.errors?.[0]?.message || err.message || "An error occurred",
      );
    }
  };

  const onResetPassword = async () => {
    setErrorMessage("");
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      });
      if (error) {
        console.error(JSON.stringify(error, null, 2));
        setErrorMessage(error.errors?.[0]?.message || "An error occurred");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              return;
            }

            const url = decorateUrl("/home");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.replace(url as Href);
            }
          },
        });
      } else {
        console.error("Password reset not complete:", signIn.status);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.errors?.[0]?.message || err.message || "An error occurred",
      );
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* Branding */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <Image source={images.idrmcLogo} className="auth-logo-image" />
                <View>
                  <Text className="auth-wordmark">IDRMC</Text>
                  <Text className="auth-wordmark-sub">USERS APPLICATION</Text>
                </View>
              </View>
              <Text className="auth-title">Reset Password</Text>
              <Text className="auth-subtitle">
                {!codeSent
                  ? "Enter your email address to reset your password"
                  : signIn?.status !== "needs_new_password"
                    ? "Enter the code sent to your email"
                    : "Enter your new password"}
              </Text>
            </View>

            {/* Form */}
            <View className="auth-card">
              <View className="auth-form">
                {!codeSent && (
                  <>
                    <View className="auth-field">
                      <Text className="auth-label">Email Address</Text>
                      <TextInput
                        className="auth-input"
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="name@example.com"
                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                        onChangeText={setEmailAddress}
                        keyboardType="email-address"
                        autoComplete="email"
                      />
                    </View>

                    {errorMessage ? (
                      <Text className="auth-error" style={{ marginBottom: 8 }}>
                        {errorMessage}
                      </Text>
                    ) : null}

                    <Pressable
                      className={`auth-button ${(!emailAddress || fetchStatus === "fetching") && "auth-button-disabled"}`}
                      onPress={onRequestReset}
                      disabled={!emailAddress || fetchStatus === "fetching"}
                    >
                      <Text className="auth-button-text">
                        {fetchStatus === "fetching"
                          ? "Sending Code..."
                          : "Send Reset Code"}
                      </Text>
                    </Pressable>
                  </>
                )}

                {codeSent && signIn?.status !== "needs_new_password" && (
                  <>
                    <View className="auth-field">
                      <Text className="auth-label">Verification Code</Text>
                      <TextInput
                        className="auth-input"
                        value={code}
                        placeholder="Enter 6-digit code"
                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>

                    {errorMessage ? (
                      <Text className="auth-error" style={{ marginBottom: 8 }}>
                        {errorMessage}
                      </Text>
                    ) : null}

                    <Pressable
                      className={`auth-button ${(!code || fetchStatus === "fetching") && "auth-button-disabled"}`}
                      onPress={onVerifyCode}
                      disabled={!code || fetchStatus === "fetching"}
                    >
                      <Text className="auth-button-text">
                        {fetchStatus === "fetching"
                          ? "Verifying..."
                          : "Verify Code"}
                      </Text>
                    </Pressable>
                  </>
                )}

                {signIn?.status === "needs_new_password" && (
                  <>
                    <View className="auth-field">
                      <Text className="auth-label">New Password</Text>
                      <TextInput
                        className="auth-input"
                        value={password}
                        placeholder="Enter new password"
                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                        secureTextEntry
                        onChangeText={setPassword}
                        autoComplete="password-new"
                      />
                    </View>

                    {errorMessage ? (
                      <Text className="auth-error" style={{ marginBottom: 8 }}>
                        {errorMessage}
                      </Text>
                    ) : null}

                    <Pressable
                      className={`auth-button ${(!password || fetchStatus === "fetching") && "auth-button-disabled"}`}
                      onPress={onResetPassword}
                      disabled={!password || fetchStatus === "fetching"}
                    >
                      <Text className="auth-button-text">
                        {fetchStatus === "fetching"
                          ? "Resetting..."
                          : "Reset Password"}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>

            <View className="auth-link-row">
              <Link href="/sign-in" asChild>
                <Pressable>
                  <Text className="auth-link">Back to Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
