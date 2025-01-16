package io.ionic.activity;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.gms.samples.pay.databinding.ActivityCheckoutSuccessBinding;

public class CheckoutSuccessfullActivity extends AppCompatActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    ActivityCheckoutSuccessBinding layoutBinding = ActivityCheckoutSuccessBinding.inflate(getLayoutInflater());
    setContentView(layoutBinding.getRoot());
  }
}
